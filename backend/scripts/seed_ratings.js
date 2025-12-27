import mongoose from 'mongoose';
import { Course } from '../model/course.model.js';
import { Review } from '../model/review.model.js';
import { User } from '../model/user.model.js';
import { env } from '../utils/env.js';
import bcrypt from 'bcrypt';

const dummyReviews = [
    { rating: 5, comment: "Absolutely amazing course! The instructor explains everything so clearly." },
    { rating: 4, comment: "Great content, but could use more practical examples in the advanced sections." },
    { rating: 5, comment: "Best investment for my career. Highly recommended!" },
    { rating: 3, comment: "Good basics, but I expected more depth on some topics." },
    { rating: 5, comment: "The project-based approach really helped me understand the concepts better." },
    { rating: 4, comment: "Solid course structure. The audio quality could be improved slightly." },
    { rating: 5, comment: "Exceeded my expectations. I feel confident applying these skills now." },
    { rating: 4, comment: "Very comprehensive. A bit fast-paced at times, but great overall." },
];

const seedRatings = async () => {
    try {
        const mongoUri = env.MONGODB_URI || 'mongodb://localhost:27017/course-platform';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // 1. Create some dummy users for reviews if they don't exist
        const userCount = 10;
        const users = [];
        const passwordHash = await bcrypt.hash('password123', 10);

        for (let i = 0; i < userCount; i++) {
            const email = `reviewer${i}@example.com`;
            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    name: `Reviewer ${i + 1}`,
                    email,
                    passwordHash,
                    role: 'student'
                });
            }
            users.push(user);
        }
        console.log(`✅ Ensured ${users.length} dummy reviewer users exist`);

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses to populate with reviews.`);

        for (const course of courses) {
            // Clear existing reviews for this course
            await Review.deleteMany({ course: course._id });

            // Randomly decide how many reviews to add (between 3 and 8)
            const numberOfReviews = Math.floor(Math.random() * 6) + 3;
            const selectedReviews = [];
            let totalRating = 0;

            // Select random unique users for reviews
            const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
            const reviewers = shuffledUsers.slice(0, numberOfReviews);

            for (let i = 0; i < numberOfReviews; i++) {
                const randomReviewTemplate = dummyReviews[Math.floor(Math.random() * dummyReviews.length)];

                // Add some variety to rating if needed, but for now stick to template
                // Adjust rating slightly just for variety? No, template is fine.

                const review = await Review.create({
                    user: reviewers[i]._id,
                    course: course._id,
                    rating: randomReviewTemplate.rating,
                    comment: randomReviewTemplate.comment,
                });

                totalRating += randomReviewTemplate.rating;
                selectedReviews.push(review);
            }

            // Update Course Aggregates
            course.ratingCount = numberOfReviews;
            course.rating = numberOfReviews > 0 ? totalRating / numberOfReviews : 0;
            await course.save();

            console.log(`Updated ${course.title}: ${course.rating.toFixed(1)} stars (${course.ratingCount} reviews)`);
        }

        console.log('✅ Successfully seeded ratings and reviews for all courses!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding ratings:', error);
        process.exit(1);
    }
};

seedRatings();
