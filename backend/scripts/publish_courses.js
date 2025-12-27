import mongoose from 'mongoose';
import { Course } from '../model/course.model.js';
import { env } from '../utils/env.js';

const publishAll = async () => {
    try {
        const mongoUri = env.MONGODB_URI || 'mongodb://localhost:27017/course-platform';
        await mongoose.connect(mongoUri);

        const result = await Course.updateMany({}, { published: true });
        console.log(`Published ${result.modifiedCount} courses.`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

publishAll();
