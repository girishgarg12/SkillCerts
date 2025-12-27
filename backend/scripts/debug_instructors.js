import mongoose from 'mongoose';
import { User } from '../model/user.model.js';
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

    console.log('Fetching all instructors...');
    const instructors = await User.find({ role: 'instructor' }).select('_id name email role');
    console.log(`Found ${instructors.length} instructors.`);

    if (instructors.length > 0) {
        const id = instructors[0]._id;
        console.log(`Testing fetch for ID: ${id}`);

        try {
            const user = await User.findById(id);
            console.log('User found:', user ? user.name : 'NULL');

            if (user) {
                console.log('Role:', user.role);
                if (user.role !== 'instructor') console.log('Role mismatch!');
            }
        } catch (e) {
            console.error('Error fetching by ID:', e);
        }
    }

    process.exit();
};

run();
