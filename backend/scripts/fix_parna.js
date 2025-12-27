import mongoose from 'mongoose';
import { User } from '../model/user.model.js';
import { Course } from '../model/course.model.js';
import { env } from '../utils/env.js';

const run = async () => {
    await mongoose.connect(env.MONGODB_URI);

    // Find Parna
    const parna = await User.findOne({ name: /Parna/i });
    if (!parna) {
        console.log('Parna not found');
        process.exit();
    }

    // Find any course to give her (that isn't one of the main ones we assigned to Girish/Dinesh already)
    // Actually, I'll just find one of the "SkillCert Team" courses or any other.
    const course = await Course.findOne({ instructor: { $ne: parna._id }, title: { $not: /Machine Learning|Data Science|Advanced React/i } });

    if (course) {
        course.instructor = parna._id;
        course.published = true;
        await course.save();
        console.log(`Assigned "${course.title}" to ${parna.name}`);
    } else {
        console.log('No suitable course found to assign to Parna.');
    }

    process.exit();
};

run();
