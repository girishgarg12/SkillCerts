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
        // 1. Fetch Instructors
        const instructors = await User.find({ role: 'instructor' });
        console.log(`Found ${instructors.length} instructors.`);

        if (instructors.length === 0) {
            console.log('No instructors found. Cannot assign.');
            process.exit();
        }

        // 2. Fetch Courses
        let courses = await Course.find({});
        console.log(`Found ${courses.length} courses.`);

        // 3. Ensure enough courses exist (Create copies if needed)
        if (courses.length < instructors.length) {
            const needed = instructors.length - courses.length;
            console.log(`Need ${needed} more courses to ensure 1 per instructor. CLONING...`);

            for (let i = 0; i < needed; i++) {
                const source = courses[i % courses.length];
                // Clone
                const newCourseData = source.toObject();
                delete newCourseData._id;
                delete newCourseData.createdAt;
                delete newCourseData.updatedAt;
                delete newCourseData.__v;

                newCourseData.title = `${source.title} ${i + 1}`;
                newCourseData.slug = `${source.slug}-${i + 1}`;
                newCourseData.published = true;

                const newCourse = await Course.create(newCourseData);
                courses.push(newCourse);
                console.log(`Created copy: ${newCourse.title}`);
            }
        }

        // 4. Distribute Courses (Round Robin)
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const instructor = instructors[i % instructors.length];

            course.instructor = instructor._id;
            course.published = true;
            await course.save();
            console.log(`Assigned "${course.title}" to ${instructor.name}`);
        }

        console.log('All instructors assigned at least one course.');

    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
};

run();
