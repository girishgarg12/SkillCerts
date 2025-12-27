import mongoose from 'mongoose';
import { Course } from '../model/course.model.js';
import { Section } from '../model/section.model.js';
import { Lecture } from '../model/lecture.model.js';
import { env } from '../utils/env.js';

// Dummy video URLs (using some generic tech talk placeholders or similar if needed, 
// but for now I'll use the one from the logs/mock data which seemed to work: "https://www.youtube.com/embed/dQw4w9WgXcQ")
const DEMO_VIDEO_URL = "https://www.youtube.com/embed/f02mOEt11OQ";

const sectionsTemplate = [
    {
        title: "Introduction",
        lectures: [
            { title: "Course Overview", duration: 300, isPreview: true },
            { title: "Setting Up Your Environment", duration: 600, isPreview: false }
        ]
    },
    {
        title: "Core Concepts",
        lectures: [
            { title: "Fundamental Theory", duration: 900, isPreview: false },
            { title: "Key Terminology", duration: 450, isPreview: false },
            { title: "First Practical Example", duration: 1200, isPreview: false }
        ]
    },
    {
        title: "Advanced Topics",
        lectures: [
            { title: "Deep Dive Analysis", duration: 1500, isPreview: false },
            { title: "Complex Scenarios", duration: 1800, isPreview: false },
            { title: "Final Project Brief", duration: 600, isPreview: false }
        ]
    }
];

const seedContent = async () => {
    try {
        const mongoUri = env.MONGODB_URI || 'mongodb://localhost:27017/course-platform';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses to populate.`);

        for (const course of courses) {
            console.log(`Processing course: ${course.title}...`);

            // 1. Clear existing content for this course
            // Find sections for this course
            const existingSections = await Section.find({ course: course._id });
            const existingSectionIds = existingSections.map(s => s._id);

            // Delete lectures for these sections
            await Lecture.deleteMany({ section: { $in: existingSectionIds } });

            // Delete sections
            await Section.deleteMany({ course: course._id });

            // 2. Add new content
            let sectionOrder = 0;
            for (const sectData of sectionsTemplate) {
                const section = await Section.create({
                    title: sectData.title,
                    course: course._id,
                    order: sectionOrder++
                });

                let lectureOrder = 0;
                const lecturesToCreate = sectData.lectures.map(lec => ({
                    title: lec.title,
                    section: section._id,
                    videoUrl: DEMO_VIDEO_URL,
                    duration: lec.duration,
                    isPreview: lec.isPreview,
                    order: lectureOrder++
                }));

                await Lecture.insertMany(lecturesToCreate);
            }

            // Update course duration
            const totalDuration = sectionsTemplate.reduce((acc, sect) => {
                return acc + sect.lectures.reduce((lAcc, lec) => lAcc + lec.duration, 0);
            }, 0);

            course.totalDuration = totalDuration;
            await course.save();
        }

        console.log('✅ Successfully added dummy content to all courses!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding content:', error);
        process.exit(1);
    }
};

seedContent();
