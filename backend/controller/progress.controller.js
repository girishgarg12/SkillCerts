import { z } from 'zod';
import { progressService } from '../services/progress.service.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schema
const toggleLectureSchema = z.object({
  lectureId: z.string().min(1, 'Lecture ID is required'),
});

/**
 * Get course progress for current user
 */
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await progressService.getCourseProgress(courseId, req.user._id);
    return ApiResponse.success('Progress fetched successfully', progress).send(res);
  } catch (error) {
    if (error.message === 'Not enrolled in this course') {
      return ApiResponse.forbidden('Not enrolled in this course').send(res);
    }
    if (error.message === 'Progress not found') {
      return ApiResponse.notFound('Progress not found').send(res);
    }
    console.error('Get course progress error:', error);
    return ApiResponse.serverError('Failed to fetch progress').send(res);
  }
};

/**
 * Get all progress for current user
 */
export const getMyProgress = async (req, res) => {
  try {
    const progressWithDetails = await progressService.getMyProgress(req.user._id);
    return ApiResponse.success('All progress fetched successfully', progressWithDetails).send(res);
  } catch (error) {
    console.error('Get all progress error:', error);
    return ApiResponse.serverError('Failed to fetch progress').send(res);
  }
};

/**
 * Toggle lecture completion (mark as completed/uncompleted)
 */
export const toggleLectureCompletion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lectureId } = toggleLectureSchema.parse(req.body);
    const result = await progressService.toggleLectureCompletion(courseId, lectureId, req.user._id);

    return ApiResponse.success(
      result.isCompleted ? 'Lecture marked as completed' : 'Lecture marked as incomplete',
      {
        progress: result.progress,
        courseCompleted: result.courseCompleted,
      }
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(res);
    }
    if (error.message === 'Not enrolled in this course') {
      return ApiResponse.forbidden('Not enrolled in this course').send(res);
    }
    if (error.message === 'Lecture not found') {
      return ApiResponse.notFound('Lecture not found').send(res);
    }
    if (error.message === 'Lecture does not belong to this course') {
      return ApiResponse.badRequest(error.message).send(res);
    }
    console.error('Toggle lecture completion error:', error);
    return ApiResponse.serverError('Failed to update lecture completion').send(res);
  }
};

/**
 * Reset course progress
 */
export const resetProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await progressService.resetProgress(courseId, req.user._id);
    return ApiResponse.success('Progress reset successfully', progress).send(res);
  } catch (error) {
    if (error.message === 'Not enrolled in this course') {
      return ApiResponse.forbidden('Not enrolled in this course').send(res);
    }
    if (error.message === 'Progress not found') {
      return ApiResponse.notFound('Progress not found').send(res);
    }
    console.error('Reset progress error:', error);
    return ApiResponse.serverError('Failed to reset progress').send(res);
  }
};
