import mongoose from 'mongoose';
import { User } from '../model/user.model.js';
import { Course } from '../model/course.model.js';
import { env } from '../utils/env.js';

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('DB Connected');
    } catch (error) {
        console.error('DB Config Error:', error);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();

    try {
        // 1. Find or Create Instructors
        let girish = await User.findOne({ name: /Girish/i, role: 'instructor' });
        let parna = await User.findOne({ name: /Parna/i, role: 'instructor' });

        // Find or Create "Hidden" Owner (Admin role so they don't show in instructor list)
        let systemUser = await User.findOne({ role: 'admin' });
        if (!systemUser) {
            console.log('Admin not found. Creating default admin for orphan courses...');
            systemUser = await User.create({
                name: 'SkillCert Team',
                email: 'admin@skillcert.com',
                passwordHash: '$2b$10$dummyhashvalueforpassword123',
                role: 'admin',
                bio: 'Official SkillCert Course Content.'
            });
        }

        if (!girish || !parna) {
            console.error('Critical: Instructors not found! Please ensure Girish and Parna exist.');
            // Fallback provided in previous script, hopefully they exist now.
        }

        // 2. Fetch All Courses
        const courses = await Course.find({});
        console.log(`Found ${courses.length} total courses.`);

        // 3. Assign
        const girishCourses = courses.slice(0, 3);
        const parnaCourses = courses.slice(3, 5);
        const otherCourses = courses.slice(5);

        for (const course of girishCourses) {
            if (girish) {
                course.instructor = girish._id;
                course.published = true;
                await course.save();
                console.log(`Assigned "${course.title}" to Girish.`);
            }
        }

        for (const course of parnaCourses) {
            if (parna) {
                course.instructor = parna._id;
                course.published = true;
                await course.save();
                console.log(`Assigned "${course.title}" to Parna.`);
            }
        }

        for (const course of otherCourses) {
            course.instructor = systemUser._id;
            course.published = true; // KEEP PUBLISHED
            await course.save();
            console.log(`Assigned "${course.title}" to System Admin (Hidden from Instructor List).`);
        }

        console.log('Data reassigned successfully.');

    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
};

run();
