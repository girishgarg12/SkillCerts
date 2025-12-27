import mongoose from 'mongoose';
import { User } from '../model/user.model.js';
import { Course } from '../model/course.model.js';
import { env } from '../utils/env.js';

const INSTRUCTOR_BIOS = [
    "Expert Full Stack Developer with 10+ years of experience in building scalable web applications. Passionate about teaching modern technologies.",
    "Data Scientist and AI Enthusiast. Specializes in Machine Learning, Deep Learning, and Computer Vision. dedicated to making complex concepts easy to understand.",
    "Cloud Computing Architect with a focus on AWS and Azure. Certified Solutions Architect helping students master cloud infrastructure.",
    "Senior UX/UI Designer with a background in Psychology. Believes in user-centric design and creating beautiful, functional interfaces.",
    "Mobile App Developer (iOS & Android) with 8 years of industry experience. Published 20+ apps on App Store and Play Store.",
    "Cybersecurity Specialist and Ethical Hacker. committed to teaching the importance of security in the digital age.",
    "DevOps Engineer with expertise in Kubernetes, Docker, and CI/CD pipelines. Automating everything is my motto."
];

const seedProfiles = async () => {
    try {
        const mongoUri = env.MONGODB_URI || 'mongodb://localhost:27017/course-platform';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Find all users who are instructors of at least one course
        const courses = await Course.find({}).populate('instructor');
        const instructorIds = [...new Set(courses.map(c => c.instructor._id.toString()))];

        console.log(`Found ${instructorIds.length} active instructors.`);

        for (const instructorId of instructorIds) {
            const user = await User.findById(instructorId);
            if (user) {
                // Generate a random bio if missing or generic
                const randomBio = INSTRUCTOR_BIOS[Math.floor(Math.random() * INSTRUCTOR_BIOS.length)];

                // Update profile
                user.bio = user.bio && user.bio.length > 50 ? user.bio : randomBio;

                // Ensure avatar
                if (!user.avatar || user.avatar.includes('ui-avatars')) {
                    // Keep ui-avatars as they are good dummy avatars, 
                    // or update to a more "photo-realistic" dummy if desired? 
                    // Let's stick to ui-avatars but ensure they are set.
                    user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=200`;
                }

                user.role = 'instructor'; // Reinforce role
                user.isVerified = true; // Reinforce verification

                await user.save();
                console.log(`Updated profile for ${user.name}`);
            }
        }

        console.log('✅ Instructors profiles seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding profiles:', error);
        process.exit(1);
    }
};

seedProfiles();
