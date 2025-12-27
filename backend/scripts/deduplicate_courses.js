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
        // Find or Create Hidden Owner (SkillCert Team)
        let systemUser = await User.findOne({ role: 'admin' });
        if (!systemUser) {
            console.log('Admin not found. Creating default admin...');
            // (Code to create admin if missing, same as before)
            systemUser = await User.create({
                name: 'SkillCert Team',
                email: 'admin@skillcert.com',
                passwordHash: 'dummy',
                role: 'admin'
            });
        }

        const instructors = await User.find({ role: 'instructor' });

        for (const instructor of instructors) {
            const courses = await Course.find({ instructor: instructor._id }).sort({ createdAt: -1 });

            // Check for duplicates based on similar titles
            // We'll normalize title: remove " A-Z", remove " <numbers>", to lowercase
            // Actually, just simplistic check: "startsWith"

            const processedTitles = new Set();

            for (const course of courses) {
                // Normalize title to detect "Machine Learning A-Z" vs "Machine Learning A-Z 4"
                // Simple heuristic: Remove trailing numbers.
                const baseTitle = course.title.replace(/\s\d+$/, '').trim();

                if (processedTitles.has(baseTitle)) {
                    // Duplicate found!
                    console.log(`Instructor ${instructor.name} has duplicate for "${baseTitle}": "${course.title}". Reassigning to Admin.`);
                    course.instructor = systemUser._id;
                    // Keep published status as is, but now it belongs to Admin (so hidden from Instructor list)
                    await course.save();
                } else {
                    processedTitles.add(baseTitle);
                    // Also add the exact title to safely ignore perfectly identical ones handled by logic (though _id differs)
                }
            }
        }
        console.log('Deduplication complete.');

    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
};

run();
