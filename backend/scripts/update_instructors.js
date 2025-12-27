import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../model/user.model.js';
import { Course } from '../model/course.model.js';
import { env } from '../utils/env.js';

const SPECIFIC_INSTRUCTORS = [
    { name: "Girish Garg", email: "girishgarg@example.com" },
    { name: "Parna Ghosh", email: "parnaghosh@example.com" },
    { name: "Dinesh", email: "dinesh@example.com" }
];

const RANDOM_INSTRUCTORS = [
    { name: "John Smith", email: "johnsmith@example.com" },
    { name: "Sarah Wilson", email: "sarahwilson@example.com" },
    { name: "Michael Brown", email: "michaelbrown@example.com" },
    { name: "Emily Davis", email: "emilydavis@example.com" },
    { name: "David Lee", email: "davidlee@example.com" },
    { name: "Jessica Taylor", email: "jessicataylor@example.com" },
    { name: "Robert Martin", email: "robertmartin@example.com" },
    { name: "Lisa Anderson", email: "lisaanderson@example.com" }
];

const getOrCreateInstructor = async (data, password) => {
    let user = await User.findOne({ email: data.email });
    if (!user) {
        // console.log(`Creating instructor: ${data.name}`);
        user = await User.create({
            name: data.name,
            email: data.email,
            passwordHash: password,
            role: 'instructor',
            isVerified: true,
            bio: `Expert instructor with a focus on delivering high-quality education in ${data.name}'s field of expertise.`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
        });
    } else {
        if (user.role !== 'instructor') {
            user.role = 'instructor';
            await user.save();
        }
    }
    return user._id;
};

const updateInstructors = async () => {
    try {
        const mongoUri = env.MONGODB_URI || 'mongodb://localhost:27017/course-platform';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        // 1. Convert specific instructors to IDs
        const specificInstructorIds = [];
        for (const data of SPECIFIC_INSTRUCTORS) {
            specificInstructorIds.push(await getOrCreateInstructor(data, hashedPassword));
        }

        // 2. Convert random instructors to IDs
        const randomInstructorIds = [];
        for (const data of RANDOM_INSTRUCTORS) {
            randomInstructorIds.push(await getOrCreateInstructor(data, hashedPassword));
        }

        // 3. Update Courses
        const courses = await Course.find({}).sort({ createdAt: 1 }); // Sort to ensure consistent order
        console.log(`Found ${courses.length} courses to update.`);

        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            let instructorId;
            let instructorName;

            if (i < 3) {
                // First 3 courses go to specific instructors
                instructorId = specificInstructorIds[i];
                instructorName = SPECIFIC_INSTRUCTORS[i].name;
            } else {
                // Rest go to random instructors (round robin from random list)
                const randomIndex = (i - 3) % randomInstructorIds.length;
                instructorId = randomInstructorIds[randomIndex];
                instructorName = RANDOM_INSTRUCTORS[randomIndex].name;
            }

            course.instructor = instructorId;
            await course.save();
            console.log(`Assigned "${course.title}" -> ${instructorName}`);
        }

        console.log('✅ Successfully redistributed course instructors!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating instructors:', error);
        process.exit(1);
    }
};

updateInstructors();
