import { z } from 'zod';
import ApiResponse from '../utils/ApiResponse.js';
import { userService } from '../services/user.service.js';

const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
});
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
});
const forgotPasswordSchema = z.object({ email: z.string().email() });
const resetPasswordSchema = z.object({ token: z.string().min(1), newPassword: z.string().min(6) });

export const getProfile = async (req, res) => {
    try {
        const user = await userService.getUserProfile(req.user._id);
        return ApiResponse.success('Profile fetched successfully', user).send(res);
    } catch (error) {
        if (error.message === 'User not found') return ApiResponse.notFound('User not found').send(res);
        console.error('Get profile error:', error);
        return ApiResponse.serverError('Failed to fetch profile').send(res);
    }
};

export const updateProfile = async (req, res) => {
    try {
        const validatedData = updateProfileSchema.parse(req.body);
        const user = await userService.updateUserProfile(req.user._id, validatedData);
        return ApiResponse.success('Profile updated successfully', user).send(res);
    } catch (error) {
        if (error instanceof z.ZodError) return ApiResponse.badRequest('Validation failed', error.errors).send(res);
        if (error.message === 'User not found') return ApiResponse.notFound('User not found').send(res);
        console.error('Update profile error:', error);
        return ApiResponse.serverError('Failed to update profile').send(res);
    }
};

export const changePassword = async (req, res) => {
    try {
        const validatedData = changePasswordSchema.parse(req.body);
        await userService.changePassword(req.user._id, validatedData.currentPassword, validatedData.newPassword);
        return ApiResponse.success('Password changed successfully', null).send(res);
    } catch (error) {
        if (error instanceof z.ZodError) return ApiResponse.badRequest('Validation failed', error.errors).send(res);
        if (error.message === 'Current password is incorrect') return ApiResponse.unauthorized('Current password is incorrect').send(res);
        console.error('Change password error:', error);
        return ApiResponse.serverError('Failed to change password').send(res);
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const validatedData = forgotPasswordSchema.parse(req.body);
        await userService.requestPasswordReset(validatedData.email);
        return ApiResponse.success('If the email exists, a password reset link has been sent', null).send(res);
    } catch (error) {
        if (error instanceof z.ZodError) return ApiResponse.badRequest('Validation failed', error.errors).send(res);
        console.error('Forgot password error:', error);
        return ApiResponse.serverError('Failed to process request').send(res);
    }
};

export const resetPassword = async (req, res) => {
    try {
        const validatedData = resetPasswordSchema.parse(req.body);
        await userService.resetPassword(validatedData.token, validatedData.newPassword);
        return ApiResponse.success('Password reset successfully.', null).send(res);
    } catch (error) {
        if (error instanceof z.ZodError) return ApiResponse.badRequest('Validation failed', error.errors).send(res);
        if (error.message === 'Invalid or expired reset token') return ApiResponse.badRequest('Invalid or expired reset token').send(res);
        console.error('Reset password error:', error);
        return ApiResponse.serverError('Failed to reset password').send(res);
    }
};

export const getAllInstructors = async (req, res) => {
    try {
        const instructors = await userService.getAllInstructors();
        return ApiResponse.success('Instructors fetched successfully', instructors).send(res);
    } catch (error) {
        console.error('Get all instructors error:', error);
        return ApiResponse.serverError('Failed to fetch instructors').send(res);
    }
};

export const getInstructor = async (req, res) => {
    try {
        console.log('Fetching instructor with ID:', req.params.id);
        const instructor = await userService.getInstructorById(req.params.id);
        return ApiResponse.success('Instructor fetched successfully', instructor).send(res);
    } catch (error) {
        console.error('Get instructor error details:', error);
        if (error.message === 'Instructor not found') return ApiResponse.notFound('Instructor not found').send(res);
        return ApiResponse.serverError('Failed to fetch instructor').send(res);
    }
};
