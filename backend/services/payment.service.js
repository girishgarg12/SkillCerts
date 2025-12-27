import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../model/payment.model.js';
import { Course } from '../model/course.model.js';
import { Enrollment } from '../model/enrollment.model.js';
import { Progress } from '../model/progress.model.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendEmail.js';
import { coursePurchasedTemplate } from '../utils/email-template/payment-done.js';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: env.RZP_KEY,
    key_secret: env.RZP_SECRET,
});

export const paymentService = {
    async createOrder(courseId, userId, userName) {
        // Fetch course from DB
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');

        if (!course.published) throw new Error('Course is not available for purchase');

        // Check if user is the instructor of this course
        if (course.instructor.toString() === userId.toString()) {
            throw new Error('You cannot purchase a course you created');
        }

        // Check if it's a free course
        if (course.isFree) throw new Error('This is a free course, no payment required');

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        if (existingEnrollment) throw new Error('Already enrolled in this course');

        // Check if payment already successful
        const existingPayment = await Payment.findOne({
            user: userId,
            course: courseId,
            status: 'success',
        });

        if (existingPayment) throw new Error('Payment already completed for this course');

        // Calculate amount from backend
        const amount = Math.round(course.price * 100); // Convert to paise
        const currency = 'INR';
        // Receipt must be max 40 chars - use shortened format
        const receipt = `rcpt_${Date.now()}_${userId.toString().slice(-8)}`;

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount,
            currency,
            receipt,
            notes: {
                courseId: course._id.toString(),
                userId: userId.toString(),
                courseTitle: course.title,
            },
        });

        // Store payment as pending in DB
        const payment = await Payment.create({
            user: userId,
            course: courseId,
            amount: course.price, // Store in rupees
            currency,
            status: 'pending',
            orderId: razorpayOrder.id,
            receipt: razorpayOrder.receipt,
            metadata: {
                courseTitle: course.title,
                userName: userName,
            },
        });

        return {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            paymentId: payment._id,
            courseTitle: course.title,
            key: env.RZP_KEY,
        };
    },

    async verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, userEmail, userName) {
        // Find payment by orderId
        const payment = await Payment.findOne({ orderId: razorpay_order_id });

        if (!payment) throw new Error('Payment record not found');

        // Verify user owns this payment
        if (payment.user.toString() !== userId.toString()) throw new Error('Unauthorized payment verification');

        // Check if already verified
        if (payment.status === 'success') throw new Error('Payment already verified');

        // Generate expected signature on backend
        const generatedSignature = crypto
            .createHmac('sha256', env.RZP_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        // Verify signature matches
        if (generatedSignature !== razorpay_signature) {
            // Mark payment as failed
            payment.status = 'failed';
            payment.failureReason = 'Signature verification failed';
            await payment.save();

            throw new Error('Payment verification failed');
        }

        // Signature verified - update payment status
        payment.status = 'success';
        payment.transactionId = razorpay_payment_id;
        await payment.save();

        // Auto-enroll user in course
        const enrollment = await Enrollment.create({
            user: userId,
            course: payment.course,
        });

        // Initialize progress tracking
        await Progress.create({
            user: userId,
            course: payment.course,
            completedLectures: [],
            progressPercentage: 0,
        });

        const populatedEnrollment = await Enrollment.findById(enrollment._id)
            .populate('course', 'title slug thumbnail price level')
            .populate('user', 'name email');

        // Send course purchased email (background)
        const courseUrl = `${env.FRONTEND_URL}/courses/${populatedEnrollment.course.slug}`;

        sendEmail({
            to: userEmail,
            subject: `Payment Successful - ${populatedEnrollment.course.title} 🎉`,
            html: coursePurchasedTemplate({
                userName: userName,
                courseTitle: populatedEnrollment.course.title,
                courseUrl,
                amount: payment.amount,
                currency: payment.currency,
            }),
        }).catch((err) => console.error('Course purchased email error:', err));

        return {
            payment: {
                orderId: payment.orderId,
                transactionId: payment.transactionId,
                amount: payment.amount,
                status: payment.status,
            },
            enrollment: populatedEnrollment,
        };
    },

    async getMyPayments(userId) {
        return await Payment.find({ user: userId })
            .populate('course', 'title slug thumbnail')
            .sort({ createdAt: -1 });
    },

    async getPayment(paymentId, userId) {
        const payment = await Payment.findById(paymentId).populate(
            'course',
            'title slug thumbnail price'
        );

        if (!payment) throw new Error('Payment not found');

        // Verify user owns this payment
        if (payment.user.toString() !== userId.toString()) throw new Error('Unauthorized access');

        return payment;
    },

    async getCoursePayments(courseId, userId, userRole) {
        // Fetch course
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');

        // Check authorization
        if (
            course.instructor.toString() !== userId.toString() &&
            userRole !== 'admin'
        ) throw new Error('Not authorized to view these payments');

        const payments = await Payment.find({
            course: courseId,
            status: 'success',
        })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const totalRevenue = payments.reduce(
            (sum, payment) => sum + payment.amount,
            0
        );

        return {
            totalPayments: payments.length,
            totalRevenue,
            payments,
        };
    }
};
