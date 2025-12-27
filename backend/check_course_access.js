
import mongoose from 'mongoose';
import { Course } from './model/course.model.js';
import { User } from './model/user.model.js';
import { env } from './utils/env.js';

async function check() {
    await mongoose.connect(env.MONGODB_URI);
    const lastCourse = await Course.findOne().sort({ createdAt: -1 });
    if (lastCourse) {
        console.log('COURSE_ID:' + lastCourse._id);
        console.log('COURSE_TITLE:' + lastCourse.title);
        console.log('INSTRUCTOR_ID:' + lastCourse.instructor);
        console.log('PUBLISHED:' + lastCourse.published);
    }
    const users = await User.find({ role: 'instructor' }).select('_id name email');
    users.forEach(u => {
        console.log('USER:' + u._id + '|' + u.name + '|' + u.email);
    });
    process.exit();
}
check();
