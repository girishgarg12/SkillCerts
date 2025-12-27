import { Progress } from '../model/progress.model.js';
import { Enrollment } from '../model/enrollment.model.js';
import { Lecture } from '../model/lecture.model.js';
import { Section } from '../model/section.model.js';

export const progressService = {
    async getCourseProgress(courseId, userId) {
        // Check if enrolled
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        if (!enrollment) {
            throw new Error('Not enrolled in this course');
        }

        // Get progress
        const progress = await Progress.findOne({
            user: userId,
            course: courseId,
        }).populate('completedLectures', 'title duration videoUrl');

        if (!progress) {
            throw new Error('Progress not found');
        }

        // Get total lectures in course
        const sections = await Section.find({ course: courseId });
        const sectionIds = sections.map((s) => s._id);
        const totalLectures = await Lecture.countDocuments({
            section: { $in: sectionIds },
        });

        return {
            ...progress.toObject(),
            totalLectures,
            completedCount: progress.completedLectures.length,
        };
    },

    async getMyProgress(userId) {
        const progressList = await Progress.find({ user: userId })
            .populate('course', 'title slug thumbnail')
            .sort({ updatedAt: -1 });

        // Get total lectures for each course
        const progressWithDetails = await Promise.all(
            progressList.map(async (progress) => {
                const sections = await Section.find({ course: progress.course._id });
                const sectionIds = sections.map((s) => s._id);
                const totalLectures = await Lecture.countDocuments({
                    section: { $in: sectionIds },
                });

                return {
                    ...progress.toObject(),
                    totalLectures,
                    completedCount: progress.completedLectures.length,
                };
            })
        );

        return progressWithDetails;
    },

    async toggleLectureCompletion(courseId, lectureId, userId) {
        // Check if enrolled
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        if (!enrollment) {
            throw new Error('Not enrolled in this course');
        }

        // Verify lecture belongs to this course
        const lecture = await Lecture.findById(lectureId).populate('section');
        if (!lecture) {
            throw new Error('Lecture not found');
        }

        if (lecture.section.course.toString() !== courseId) {
            throw new Error('Lecture does not belong to this course');
        }

        // Get or create progress
        let progress = await Progress.findOne({
            user: userId,
            course: courseId,
        });

        if (!progress) {
            progress = await Progress.create({
                user: userId,
                course: courseId,
                completedLectures: [],
                progressPercentage: 0,
            });
        }

        // Toggle lecture completion
        const lectureIndex = progress.completedLectures.findIndex(
            (id) => id.toString() === lectureId
        );

        let isCompleted;
        if (lectureIndex > -1) {
            // Remove from completed (mark as uncompleted)
            progress.completedLectures.splice(lectureIndex, 1);
            isCompleted = false;
        } else {
            // Add to completed
            progress.completedLectures.push(lectureId);
            isCompleted = true;
        }

        // Calculate progress percentage
        const sections = await Section.find({ course: courseId });
        const sectionIds = sections.map((s) => s._id);
        const totalLectures = await Lecture.countDocuments({
            section: { $in: sectionIds },
        });

        progress.progressPercentage =
            totalLectures > 0
                ? Math.round((progress.completedLectures.length / totalLectures) * 100)
                : 0;

        await progress.save();

        // Auto-complete course if 100% progress
        if (progress.progressPercentage === 100 && !enrollment.completed) {
            enrollment.completed = true;
            await enrollment.save();
        }

        return {
            isCompleted,
            progress: {
                completedLectures: progress.completedLectures,
                progressPercentage: progress.progressPercentage,
                totalLectures,
                completedCount: progress.completedLectures.length,
            },
            courseCompleted: enrollment.completed,
        };
    },

    async resetProgress(courseId, userId) {
        // Check if enrolled
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        if (!enrollment) {
            throw new Error('Not enrolled in this course');
        }

        // Reset progress
        const progress = await Progress.findOne({
            user: userId,
            course: courseId,
        });

        if (!progress) {
            throw new Error('Progress not found');
        }

        progress.completedLectures = [];
        progress.progressPercentage = 0;
        await progress.save();

        // Mark enrollment as not completed
        if (enrollment.completed) {
            enrollment.completed = false;
            await enrollment.save();
        }

        return progress;
    }
};
