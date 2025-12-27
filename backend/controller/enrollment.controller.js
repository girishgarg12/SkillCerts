import { z } from 'zod';
import { enrollmentService } from '../services/enrollment.service.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schema
const enrollCourseSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

/**
 * Enroll in a course (Student)
 */
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = enrollCourseSchema.parse(req.body);
    const enrollment = await enrollmentService.enrollUser(req.user._id, courseId, req.user.email, req.user.name);
    return ApiResponse.created('Enrolled successfully', enrollment).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(res);
    }
    if (error.message === 'Course not found') {
      return ApiResponse.notFound('Course not found').send(res);
    }
    if (error.message === 'Course is not published yet' || error.message.includes('Payment required') || error.message === 'You cannot enroll in a course you created') {
      return ApiResponse.badRequest(error.message).send(res);
    }
    if (error.message === 'Already enrolled in this course') {
      return ApiResponse.conflict('Already enrolled in this course').send(res);
    }
    console.error('Enroll course error:', error);
    return ApiResponse.serverError('Failed to enroll in course').send(res);
  }
};

/**
 * Get user's enrollments
 */
export const getMyEnrollments = async (req, res) => {
  try {
    const { status } = req.query;
    const enrollments = await enrollmentService.getUserEnrollments(req.user._id, status);
    return ApiResponse.success('Enrollments fetched successfully', enrollments).send(res);
  } catch (error) {
    console.error('Get enrollments error:', error);
    return ApiResponse.serverError('Failed to fetch enrollments').send(res);
  }
};

/**
 * Get single enrollment
 */
export const getEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await enrollmentService.getEnrollment(req.user._id, courseId);
    return ApiResponse.success('Enrollment fetched successfully', enrollment).send(res);
  } catch (error) {
    if (error.message === 'Enrollment not found') {
      return ApiResponse.notFound('Enrollment not found').send(res);
    }
    console.error('Get enrollment error:', error);
    return ApiResponse.serverError('Failed to fetch enrollment').send(res);
  }
};

/**
 * Check if user is enrolled in a course
 */
export const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await enrollmentService.isEnrolled(req.user._id, courseId);
    return ApiResponse.success('Enrollment status checked', result).send(res);
  } catch (error) {
    console.error('Check enrollment error:', error);
    return ApiResponse.serverError('Failed to check enrollment').send(res);
  }
};

/**
 * Unenroll from course (Student)
 */
export const unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    await enrollmentService.unenrollUser(req.user._id, courseId);
    return ApiResponse.success('Unenrolled successfully').send(res);
  } catch (error) {
    if (error.message === 'Enrollment not found') {
      return ApiResponse.notFound('Enrollment not found').send(res);
    }
    if (error.message === 'Cannot unenroll from completed course') {
      return ApiResponse.badRequest(error.message).send(res);
    }
    console.error('Unenroll course error:', error);
    return ApiResponse.serverError('Failed to unenroll from course').send(res);
  }
};

/**
 * Get course enrollments (Instructor/Admin)
 */
export const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await enrollmentService.getCourseEnrollments(courseId, req.user._id, req.user.role);
    return ApiResponse.success('Course enrollments fetched successfully', result).send(res);
  } catch (error) {
    if (error.message === 'Course not found') {
      return ApiResponse.notFound('Course not found').send(res);
    }
    if (error.message === 'Unauthorized') {
      return ApiResponse.forbidden('You are not authorized to view these enrollments').send(res);
    }
    console.error('Get course enrollments error:', error);
    return ApiResponse.serverError('Failed to fetch course enrollments').send(res);
  }
};

/**
 * Mark course as completed (Student)
 */
export const markCourseCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await enrollmentService.markCompletion(req.user._id, courseId, req.user.email, req.user.name);
    return ApiResponse.success('Course marked as completed', result).send(res);
  } catch (error) {
    if (error.message === 'Enrollment not found') {
      return ApiResponse.notFound('Enrollment not found').send(res);
    }
    if (error.message === 'Course already marked as completed') {
      return ApiResponse.badRequest(error.message).send(res);
    }
    console.error('Mark course completed error:', error);
    return ApiResponse.serverError('Failed to mark course as completed').send(res);
  }
};
