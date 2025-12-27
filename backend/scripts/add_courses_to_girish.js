import mongoose from 'mongoose';
import { User } from '../model/user.model.js';
import { Course } from '../model/course.model.js';
import { env } from '../utils/env.js';

const run = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('DB Connected');

        // 1. Find Girish Garg
        const girish = await User.findOne({ name: /Girish/i, role: 'instructor' });
        if (!girish) {
            console.error('Girish Garg not found!');
            process.exit(1);
        }

        // 2. Find 2 courses not currently assigned to him
        // We'll exclude courses already assigned to specific instructors to avoid taking theirs
        const otherInstructors = await User.find({ name: { $in: [/Parna/i, /Dinesh/i] } }).select('_id');
        const excludedIds = [girish._id, ...otherInstructors.map(i => i._id)];

        const coursesToAssign = await Course.find({
            instructor: { $nin: excludedIds },
            published: true
        }).limit(2);

        if (coursesToAssign.length < 2) {
            // If not enough published ones, take unpublished ones
            const moreCourses = await Course.find({
                instructor: { $nin: excludedIds }
            }).limit(2 - coursesToAssign.length);
            coursesToAssign.push(...moreCourses);
        }

        if (coursesToAssign.length === 0) {
            console.log('No extra courses found to assign.');
        } else {
            for (const course of coursesToAssign) {
                course.instructor = girish._id;
                course.published = true;
                await course.save();
                console.log(`Assigned "${course.title}" to Girish Garg`);
            }
        }

        console.log(`Girish Garg now has more courses.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
