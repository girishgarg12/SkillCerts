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
            dinesh = await User.create({
                name: 'Dinesh Kumar',
                email: 'dinesh_updated@example.com',
                passwordHash: '$2b$10$dummyhashvalueforpassword123',
                role: 'instructor'
            });
        }

        if (girish && parna && dinesh) {
            // 2. Update ALL matching courses

            // Machine Learning -> Girish
            const mlCourses = await Course.find({ title: /Machine Learning/i });
            for (const c of mlCourses) {
                c.instructor = girish._id;
                await c.save();
                console.log(`Updated "${c.title}" -> Girish`);
            }

            // Data Science -> Parna
            const dsCourses = await Course.find({ title: /Data Science/i });
            for (const c of dsCourses) {
                c.instructor = parna._id;
                await c.save();
                console.log(`Updated "${c.title}" -> Parna`);
            }

            // Advanced React -> Dinesh
            const arCourses = await Course.find({ title: /Advanced React/i });
            for (const c of arCourses) {
                c.instructor = dinesh._id;
                await c.save();
                console.log(`Updated "${c.title}" -> Dinesh`);
            }

        } else {
            console.log('Instructors missing.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
};

run();
