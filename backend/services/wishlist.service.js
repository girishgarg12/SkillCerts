import { Wishlist } from '../model/wishlist.model.js';
import { Course } from '../model/course.model.js';

export const wishlistService = {
    async getMyWishlist(userId) {
        let wishlist = await Wishlist.findOne({ user: userId }).populate({
            path: 'courses',
            select: 'title slug thumbnail price isFree level rating ratingCount instructor category',
            populate: [
                { path: 'instructor', select: 'name avatar' },
                { path: 'category', select: 'name slug' },
            ],
        });

        if (!wishlist) {
            wishlist = { user: userId, courses: [] };
        }

        return wishlist;
    },

    async addToWishlist(courseId, userId) {
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            throw new Error('Course not found');
        }

        // Get or create wishlist
        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: userId,
                courses: [courseId],
            });
        } else {
            // Check if already in wishlist
            if (wishlist.courses.includes(courseId)) {
                throw new Error('Course already in wishlist');
            }

            wishlist.courses.push(courseId);
            await wishlist.save();
        }

        return await Wishlist.findById(wishlist._id).populate({
            path: 'courses',
            select: 'title slug thumbnail price isFree level rating ratingCount',
            populate: { path: 'instructor', select: 'name avatar' },
        });
    },

    async removeFromWishlist(courseId, userId) {
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist || !wishlist.courses.includes(courseId)) {
            throw new Error('Course not in wishlist');
        }

        wishlist.courses = wishlist.courses.filter(
            (id) => id.toString() !== courseId
        );
        await wishlist.save();

        return true;
    },

    async checkWishlist(courseId, userId) {
        const wishlist = await Wishlist.findOne({ user: userId });
        return wishlist && wishlist.courses.includes(courseId);
    },

    async clearWishlist(userId) {
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return 0; // Already empty
        }

        const count = wishlist.courses.length;
        wishlist.courses = [];
        await wishlist.save();

        return count;
    }
};
