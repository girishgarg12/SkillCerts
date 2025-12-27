import { z } from 'zod';
import { paymentService } from '../services/payment.service.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schemas
const createOrderSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
});

/**
 * Create Razorpay order (Step 1)
 */
export const createOrder = async (req, res) => {
  try {
    const { courseId } = createOrderSchema.parse(req.body);
    const result = await paymentService.createOrder(courseId, req.user._id, req.user.name);
    return ApiResponse.success('Order created successfully', result).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(res);
    }
    if (error.message === 'Course not found') {
      return ApiResponse.notFound('Course not found').send(res);
    }
    if (error.message === 'Course is not available for purchase' || error.message === 'This is a free course, no payment required' || error.message === 'You cannot purchase a course you created') {
      return ApiResponse.badRequest(error.message).send(res);
    }
    if (error.message === 'Already enrolled in this course' || error.message === 'Payment already completed for this course') {
      return ApiResponse.conflict(error.message).send(res);
    }
    console.error('Create order error:', error);
    return ApiResponse.serverError('Failed to create order', { error: error.message }).send(res);
  }
};

/**
 * Verify payment signature (Step 2)
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verifyPaymentSchema.parse(req.body);
    const result = await paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature, req.user._id, req.user.email, req.user.name);
    return ApiResponse.success('Payment verified and enrolled successfully', result).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(res);
    }
    if (error.message === 'Payment record not found') {
      return ApiResponse.notFound('Payment record not found').send(res);
    }
    if (error.message === 'Unauthorized payment verification') {
      return ApiResponse.forbidden('Unauthorized payment verification').send(res);
    }
    if (error.message === 'Payment already verified') {
      return ApiResponse.conflict('Payment already verified').send(res);
    }
    if (error.message === 'Payment verification failed') {
      return ApiResponse.badRequest('Payment verification failed').send(res);
    }
    console.error('Verify payment error:', error);
    return ApiResponse.serverError('Failed to verify payment').send(res);
  }
};

/**
 * Get user's payment history
 */
export const getMyPayments = async (req, res) => {
  try {
    const payments = await paymentService.getMyPayments(req.user._id);
    return ApiResponse.success('Payments fetched successfully', payments).send(res);
  } catch (error) {
    console.error('Get payments error:', error);
    return ApiResponse.serverError('Failed to fetch payments').send(res);
  }
};

/**
 * Get single payment
 */
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPayment(id, req.user._id);
    return ApiResponse.success('Payment fetched successfully', payment).send(res);
  } catch (error) {
    if (error.message === 'Payment not found') {
      return ApiResponse.notFound('Payment not found').send(res);
    }
    if (error.message === 'Unauthorized access') {
      return ApiResponse.forbidden('Unauthorized access').send(res);
    }
    console.error('Get payment error:', error);
    return ApiResponse.serverError('Failed to fetch payment').send(res);
  }
};

/**
 * Get course payments (Instructor/Admin)
 */
export const getCoursePayments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await paymentService.getCoursePayments(courseId, req.user._id, req.user.role);
    return ApiResponse.success('Course payments fetched successfully', result).send(res);
  } catch (error) {
    if (error.message === 'Course not found') {
      return ApiResponse.notFound('Course not found').send(res);
    }
    if (error.message === 'Not authorized to view these payments') {
      return ApiResponse.forbidden(error.message).send(res);
    }
    console.error('Get course payments error:', error);
    return ApiResponse.serverError('Failed to fetch course payments').send(res);
  }
};
