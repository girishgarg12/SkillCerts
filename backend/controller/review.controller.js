import { z } from 'zod';
import { reviewService } from '../services/review.service.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schemas
const createReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be at most 1000 characters').optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional(),
});

/**
 * Create or update review (Student - must be enrolled)
 */
export const createReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = createReviewSchema.parse(req.body);
    const review = await reviewService.createReview(courseId, req.user._id, { rating, comment });
    return ApiResponse.created('Review created successfully', review).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(res);
    }
    if (error.message === 'Course not found') {
      return ApiResponse.notFound('Course not found').send(res);
    }
    if (error.message === 'You must be enrolled in this course to leave a review' || error.message === 'Instructors cannot review their own courses') {
      return ApiResponse.forbidden(error.message).send(res); // or badRequest depending on interpretation, original was forbidden for enrollment, badRequest for instructor
    }
    if (error.message.includes('Review already exists')) {
      return ApiResponse.conflict(error.message).send(res);
    }
    console.error('Create review error:', error);
    return ApiResponse.serverError('Failed to create review').send(res);
  }
};

/**
 * Update review
 */
export const updateReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = updateReviewSchema.parse(req.body);
    const review = await reviewService.updateReview(courseId, req.user._id, updates);
    return ApiResponse.success('Review updated successfully', review).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(res);
    }
    if (error.message.includes('Review not found')) {
      return ApiResponse.notFound(error.message).send(res);
    }
    console.error('Update review error:', error);
    return ApiResponse.serverError('Failed to update review').send(res);
  }
};

/**
 * Delete review
 */
export const deleteReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    await reviewService.deleteReview(courseId, req.user._id);
    return ApiResponse.success('Review deleted successfully').send(res);
  } catch (error) {
    if (error.message === 'Review not found') {
      return ApiResponse.notFound('Review not found').send(res);
    }
    console.error('Delete review error:', error);
    return ApiResponse.serverError('Failed to delete review').send(res);
  }
};

/**
 * Get reviews for a course (Public)
 */
export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page, limit, rating } = req.query;
    const result = await reviewService.getCourseReviews(courseId, { page, limit, rating });
    return ApiResponse.success('Reviews fetched successfully', result).send(res);
  } catch (error) {
    console.error('Get course reviews error:', error);
    return ApiResponse.serverError('Failed to fetch reviews').send(res);
  }
};

/**
 * Get user's review for a course
 */
export const getMyReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const review = await reviewService.getMyReview(courseId, req.user._id);
    return ApiResponse.success('Review fetched successfully', review).send(res);
  } catch (error) {
    if (error.message === 'Review not found') {
      return ApiResponse.notFound('Review not found').send(res);
    }
    console.error('Get my review error:', error);
    return ApiResponse.serverError('Failed to fetch review').send(res);
  }
};

/**
 * Get all reviews by current user
 */
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getMyReviews(req.user._id);
    return ApiResponse.success('Your reviews fetched successfully', reviews).send(res);
  } catch (error) {
    console.error('Get my reviews error:', error);
    return ApiResponse.serverError('Failed to fetch reviews').send(res);
  }
};
