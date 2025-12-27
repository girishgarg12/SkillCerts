import { Enrollment } from '../model/enrollment.model.js';
import { Course } from '../model/course.model.js';
import { Progress } from '../model/progress.model.js';
import { Payment } from '../model/payment.model.js';
import { Certificate } from '../model/certificate.model.js';
import { sendEmail } from '../utils/sendEmail.js';
import { certificateIssuedTemplate } from '../utils/email-template/certificate-issued.js';
import { coursePurchasedTemplate } from '../utils/email-template/payment-done.js';
import { env } from '../utils/env.js';
import { generateCertificateId } from '../utils/certificateGenerator.js';

export const enrollmentService = {
    async enrollUser(userId, courseId, userEmail, userName) {
        // ... (existing checks)
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');
        if (!course.published) throw new Error('Course is not published yet');
        if (course.instructor.toString() === userId.toString()) throw new Error('You cannot enroll in a course you created');

        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (existingEnrollment) throw new Error('Already enrolled in this course');

        if (!course.isFree) {
            const successfulPayment = await Payment.findOne({ user: userId, course: courseId, status: 'success' });
            if (!successfulPayment) throw new Error('Payment required. Please complete the payment first to enroll in this course');
        }

        const enrollment = await Enrollment.create({ user: userId, course: courseId });
        await Progress.create({ user: userId, course: courseId, completedLectures: [], progressPercentage: 0 });

        const populatedEnrollment = await Enrollment.findById(enrollment._id)
            .populate('course', 'title slug thumbnail price level')
            .populate('user', 'name email');

        // Send enrollment confirmation email if email/name provided (for free courses primarily)
        if (userEmail && userName) {
            const courseUrl = `${env.FRONTEND_URL}/courses/${populatedEnrollment.course.slug}`;
            sendEmail({
                to: userEmail,
                subject: `Enrolled Successfully - ${populatedEnrollment.course.title} 🎓`,
                html: coursePurchasedTemplate({
                    userName: userName,
                    courseTitle: populatedEnrollment.course.title,
                    courseUrl,
                    amount: course.isFree ? 0 : course.price,
                }),
            }).catch((err) => console.error('Enrollment email error:', err));
        }

        return populatedEnrollment;
    },

    async getUserEnrollments(userId, status) {
        const query = { user: userId };

        // Filter by completion status
        if (status === 'completed') {
            query.completed = true;
        } else if (status === 'ongoing') {
            query.completed = false;
        }

        const enrollments = await Enrollment.find(query)
            .populate('course', 'title slug thumbnail price level instructor')
            .populate({
                path: 'course',
                populate: {
                    path: 'instructor',
                    select: 'name avatar',
                },
            })
            .sort({ enrolledAt: -1 });

        // Get progress for each enrollment
        // Note: This could be optimized with aggregation, but strict refactoring copies logic first
        const enrollmentsWithProgress = await Promise.all(
            enrollments.map(async (enrollment) => {
                const progress = await Progress.findOne({
                    user: userId,
                    course: enrollment.course?._id, // course might be null if deleted? assume course exists
                });

                if (!enrollment.course) return null; // Handle deleted course case if populated returns null

                return {
                    ...enrollment.toObject(),
                    progress: progress
                        ? {
                            progressPercentage: progress.progressPercentage,
                            completedLectures: progress.completedLectures.length,
                        }
                        : null,
                };
            })
        );

        return enrollmentsWithProgress.filter(e => e !== null);
    },

    async getEnrollment(userId, courseId) {
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        })
            .populate('course')
            .populate('user', 'name email avatar');

        if (!enrollment) {
            throw new Error('Enrollment not found');
        }

        // Get progress
        const progress = await Progress.findOne({
            user: userId,
            course: courseId,
        });

        return {
            ...enrollment.toObject(),
            progress: progress || null,
        };
    },

    async isEnrolled(userId, courseId) {
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        return {
            isEnrolled: !!enrollment,
            enrollment: enrollment || null,
        };
    },

    async unenrollUser(userId, courseId) {
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        if (!enrollment) {
            throw new Error('Enrollment not found');
        }

        // Don't allow unenrolling if course is completed
        if (enrollment.completed) {
            throw new Error('Cannot unenroll from completed course');
        }

        // Delete enrollment and progress
        await Promise.all([
            Enrollment.findByIdAndDelete(enrollment._id),
            Progress.findOneAndDelete({ user: userId, course: courseId }),
        ]);

        return true;
    },

    async getCourseEnrollments(courseId, userId, userRole) {
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            throw new Error('Course not found');
        }

        // Check if user is the instructor or admin
        if (
            course.instructor.toString() !== userId.toString() &&
            userRole !== 'admin'
        ) {
            throw new Error('Unauthorized');
        }

        const enrollments = await Enrollment.find({ course: courseId })
            .populate('user', 'name email avatar')
            .sort({ enrolledAt: -1 });

        // Get progress for each enrollment
        const enrollmentsWithProgress = await Promise.all(
            enrollments.map(async (enrollment) => {
                const progress = await Progress.findOne({
                    user: enrollment.user._id,
                    course: courseId,
                });

                return {
                    ...enrollment.toObject(),
                    progress: progress
                        ? {
                            progressPercentage: progress.progressPercentage,
                            completedLectures: progress.completedLectures.length,
                        }
                        : null,
                };
            })
        );

        return {
            totalEnrollments: enrollments.length,
            enrollments: enrollmentsWithProgress,
        };
    },

    async markCompletion(userId, courseId, userEmail, userName) {
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        if (!enrollment) {
            throw new Error('Enrollment not found');
        }

        if (enrollment.completed) {
            throw new Error('Course already marked as completed');
        }

        enrollment.completed = true;
        await enrollment.save();

        // Auto-generate certificate record
        const existingCertificate = await Certificate.findOne({
            user: userId,
            course: courseId,
        });

        let certificate = null;
        if (!existingCertificate) {
            const certificateId = generateCertificateId();

            try {
                certificate = await Certificate.create({
                    user: userId,
                    course: courseId,
                    certificateId,
                    issuedAt: new Date(),
                });

                // Send certificate issued email (background)
                const course = await Course.findById(courseId);
                const certificateUrl = `${env.FRONTEND_URL}/certificates/${certificateId}`;

                sendEmail({
                    to: userEmail,
                    subject: `🏆 Your Certificate is Ready - ${course.title}`,
                    html: certificateIssuedTemplate({
                        userName: userName,
                        courseTitle: course.title,
                        certificateUrl,
                        certificateId,
                    }),
                }).catch((err) => console.error('Certificate email error:', err));
            } catch (certError) {
                console.error('Certificate record creation error:', certError);
            }
        }

        return {
            enrollment,
            certificate: certificate || existingCertificate,
        };
    }
};
