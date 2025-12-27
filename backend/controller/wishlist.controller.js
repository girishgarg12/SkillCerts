import { z } from 'zod';
import { wishlistService } from '../services/wishlist.service.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schema
const addToWishlistSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

/**
 * Get user's wishlist
 */
export const getMyWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.getMyWishlist(req.user._id);
    return ApiResponse.success('Wishlist fetched successfully', wishlist).send(res);
  } catch (error) {
    console.error('Get wishlist error:', error);
    return ApiResponse.serverError('Failed to fetch wishlist').send(res);
  }
};

/**
 * Add course to wishlist
 */
export const addToWishlist = async (req, res) => {
  try {
    const { courseId } = addToWishlistSchema.parse(req.body);
    const wishlist = await wishlistService.addToWishlist(courseId, req.user._id);
    return ApiResponse.created('Course added to wishlist', wishlist).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(res);
    }
    if (error.message === 'Course not found') {
      return ApiResponse.notFound('Course not found').send(res);
    }
    if (error.message === 'Course already in wishlist') {
      return ApiResponse.conflict('Course already in wishlist').send(res);
    }
    console.error('Add to wishlist error:', error);
    return ApiResponse.serverError('Failed to add to wishlist').send(res);
  }
};

/**
 * Remove course from wishlist
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    await wishlistService.removeFromWishlist(courseId, req.user._id);
    return ApiResponse.success('Course removed from wishlist').send(res);
  } catch (error) {
    if (error.message === 'Course not in wishlist') {
      return ApiResponse.notFound('Course not in wishlist').send(res);
    }
    console.error('Remove from wishlist error:', error);
    return ApiResponse.serverError('Failed to remove from wishlist').send(res);
  }
};

/**
 * Check if course is in wishlist
 */
export const checkWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const isInWishlist = await wishlistService.checkWishlist(courseId, req.user._id);
    return ApiResponse.success('Wishlist status checked', { isInWishlist }).send(res);
  } catch (error) {
    console.error('Check wishlist error:', error);
    return ApiResponse.serverError('Failed to check wishlist status').send(res);
  }
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = async (req, res) => {
  try {
    const count = await wishlistService.clearWishlist(req.user._id);
    const message = count > 0 ? `Wishlist cleared (${count} items removed)` : 'Wishlist is already empty';
    return ApiResponse.success(message).send(res);
  } catch (error) {
    console.error('Clear wishlist error:', error);
    return ApiResponse.serverError('Failed to clear wishlist').send(res);
  }
};

