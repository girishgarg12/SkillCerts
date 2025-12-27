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
        // 1. Get Instructors
        const girish = await User.findOne({ name: /Girish/i, role: 'instructor' });
        const parna = await User.findOne({ name: /Parna/i, role: 'instructor' });
        let dinesh = await User.findOne({ name: /Dinesh/i, role: 'instructor' });

        if (!dinesh) {
            console.log('Dinesh not found. Creating...');
            dinesh = await User.create({
                name: 'Dinesh Kumar',
                email: 'dinesh@example.com',
                passwordHash: '$2b$10$dummyhashvalueforpassword123',
                role: 'instructor',
                bio: 'Passionate educator with years of experience.'
            });
        }

        if (!girish) console.error('Girish missing!');
        if (!parna) console.error('Parna missing!');

        // 2. Find and Assign Courses
        // Use regex for flexibility
        const course1 = await Course.findOne({ title: /Machine Learning/i });
        const course2 = await Course.findOne({ title: /Data Science/i });
        const course3 = await Course.findOne({ title: /Advanced React/i });

        if (course1 && girish) {
            course1.instructor = girish._id;
            await course1.save();
            console.log(`Assigned "${course1.title}" to Girish.`);
        }

        if (course2 && parna) {
            course2.instructor = parna._id;
            await course2.save();
            console.log(`Assigned "${course2.title}" to Parna.`);
        }

        if (course3 && dinesh) {
            course3.instructor = dinesh._id;
            await course3.save();
            console.log(`Assigned "${course3.title}" to Dinesh.`);
        }

        console.log('Assignment complete.');

    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
};

run();
