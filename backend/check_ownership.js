import mongoose from 'mongoose';
import { Course } from './model/course.model.js';
import { User } from './model/user.model.js';
import { env } from './utils/env.js';

async function check() {
    await mongoose.connect(env.MONGODB_URI);
    const courseId = '694d8f0b67467a345d6ccb41';
    const course = await Course.findById(courseId).populate('instructor');

    if (!course) {
        console.log('--- COURSE NOT FOUND ---');
    } else {
        console.log('--- COURSE DATA ---');
        console.log(JSON.stringify({
            id: course._id,
            title: course.title,
            instructorId: course.instructor._id,
            instructorName: course.instructor.name,
            instructorEmail: course.instructor.email,
            published: course.published
        }, null, 2));
    }

    const users = await User.find({ role: 'instructor' });
    console.log('--- ALL INSTRUCTORS ---');
    console.log(JSON.stringify(users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email
    })), null, 2));

    await mongoose.disconnect();
}

check().catch(console.error);
