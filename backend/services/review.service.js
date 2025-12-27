import { Review } from '../model/review.model.js';
import { Course } from '../model/course.model.js';
import { Enrollment } from '../model/enrollment.model.js';
import mongoose from 'mongoose';

async function updateCourseRating(courseId) {
    const stats = await Review.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await Course.findByIdAndUpdate(courseId, {
            rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
            ratingCount: stats[0].count,
        });
    } else {
        // No reviews, reset rating
        await Course.findByIdAndUpdate(courseId, {
            rating: 0,
            ratingCount: 0,
        });
    }
}

export const reviewService = {
    async createReview(courseId, userId, { rating, comment }) {
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            throw new Error('Course not found');
        }

        // Check if user is enrolled
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        if (!enrollment) {
            throw new Error('You must be enrolled in this course to leave a review');
        }

        // Check if user is the instructor
        if (course.instructor.toString() === userId.toString()) {
            throw new Error('Instructors cannot review their own courses');
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            user: userId,
            course: courseId,
        });

        if (existingReview) {
            throw new Error('Review already exists. Use update endpoint to modify it');
        }

        // Create review
        const review = await Review.create({
            user: userId,
            course: courseId,
            rating,
            comment,
        });

        // Update course rating
        await updateCourseRating(courseId);

        return await Review.findById(review._id)
            .populate('user', 'name avatar')
            .populate('course', 'title slug');
    },

    async updateReview(courseId, userId, { rating, comment }) {
        // Find review
        const review = await Review.findOne({
            user: userId,
            course: courseId,
        });

        if (!review) {
            throw new Error('Review not found. Create a review first');
        }

        // Update fields
        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();

        // Update course rating
        await updateCourseRating(courseId);

        return await Review.findById(review._id)
            .populate('user', 'name avatar')
            .populate('course', 'title slug');
    },

    async deleteReview(courseId, userId) {
        const review = await Review.findOneAndDelete({
            user: userId,
            course: courseId,
        });

        if (!review) {
            throw new Error('Review not found');
        }

        // Update course rating
        await updateCourseRating(courseId);

        return true;
    },

    async getCourseReviews(courseId, { page = 1, limit = 10, rating } = {}) {
        const query = { course: courseId };

        // Filter by rating
        if (rating) {
            query.rating = parseInt(rating);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate('user', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Review.countDocuments(query),
        ]);

        // Calculate rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { course: new mongoose.Types.ObjectId(courseId) } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
        ]);

        return {
            reviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
            ratingDistribution,
        };
    },

    async getMyReview(courseId, userId) {
        const review = await Review.findOne({
            user: userId,
            course: courseId,
        })
            .populate('user', 'name avatar')
            .populate('course', 'title slug');

        if (!review) {
            throw new Error('Review not found');
        }

        return review;
    },

    async getMyReviews(userId) {
        return await Review.find({ user: userId })
            .populate('course', 'title slug thumbnail')
            .sort({ createdAt: -1 });
    }
};
