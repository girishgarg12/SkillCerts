import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User } from '../model/user.model.js';
import { Course } from '../model/course.model.js';
import { sendEmail } from '../utils/sendEmail.js';
import { passwordResetTemplate } from '../utils/email-template/password-reset.js';
import { env } from '../utils/env.js';

export const userService = {
    async getUserProfile(userId) {
        const user = await User.findById(userId).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
        if (!user) throw new Error('User not found');
        return user;
    },

    async updateUserProfile(userId, data) {
        const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true }).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
        if (!user) throw new Error('User not found');
        return user;
    },

    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) throw new Error('Current password is incorrect');
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();
        return true;
    },

    async requestPasswordReset(email) {
        const user = await User.findOne({ email });
        if (!user) return false;
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await user.save();
        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendEmail({
            to: user.email,
            subject: 'Reset Your Password - SkillCerts',
            html: passwordResetTemplate({ userName: user.name, resetUrl, expiresIn: '1 hour' }),
        });
        return true;
    },

    async resetPassword(token, newPassword) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) throw new Error('Invalid or expired reset token');
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return true;
    },

    async getAllInstructors() {
        return await User.aggregate([
            { $match: { role: 'instructor' } },
            {
                $lookup: {
                    from: 'courses',
                    let: { instructorId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$instructor', '$$instructorId'] }, { $eq: ['$published', true] }] } } }
                    ],
                    as: 'courses'
                }
            },
            {
                $project: {
                    _id: 1, name: 1, avatar: 1, bio: 1, role: 1,
                    totalCourses: { $size: '$courses' },
                    averageRating: { $cond: { if: { $eq: [{ $size: '$courses' }, 0] }, then: 0, else: { $avg: '$courses.rating' } } },
                    totalReviews: { $sum: '$courses.ratingCount' },
                    courses: { $map: { input: '$courses', as: 'c', in: { _id: '$$c._id', title: '$$c.title', slug: '$$c.slug', thumbnail: '$$c.thumbnail', rating: '$$c.rating', ratingCount: '$$c.ratingCount', price: '$$c.price', isFree: '$$c.isFree' } } },
                    priority: {
                        $cond: {
                            if: { $regexMatch: { input: "$name", regex: "Girish", options: "i" } },
                            then: 1,
                            else: {
                                $cond: {
                                    if: { $regexMatch: { input: "$name", regex: "Parna", options: "i" } },
                                    then: 2,
                                    else: {
                                        $cond: {
                                            if: { $regexMatch: { input: "$name", regex: "Dinesh", options: "i" } },
                                            then: 3,
                                            else: 100
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $match: { totalCourses: { $gt: 0 } } },
            { $sort: { priority: 1, totalReviews: -1, averageRating: -1 } }
        ]);
    },

    async getInstructorById(id) {
        const user = await User.findById(id).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
        if (!user) throw new Error('Instructor not found');
        if (user.role !== 'instructor') throw new Error('User is not an instructor');

        const courses = await Course.find({ instructor: id, published: true })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });

        const totalCourses = courses.length;
        const totalReviews = courses.reduce((acc, c) => acc + (c.ratingCount || 0), 0);
        const averageRating = totalCourses > 0
            ? courses.reduce((acc, c) => acc + (c.rating || 0), 0) / totalCourses
            : 0;

        return {
            ...user.toObject(),
            totalCourses,
            totalReviews,
            averageRating,
            courses
        };
    }
};
