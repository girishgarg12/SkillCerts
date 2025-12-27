import { Lecture } from '../model/lecture.model.js';
import { Section } from '../model/section.model.js';
import { Enrollment } from '../model/enrollment.model.js';

export const lectureService = {
    async getSectionLectures(sectionId, currentUser = null) {
        const section = await Section.findById(sectionId).populate('course');
        if (!section) throw new Error('Section not found');
        if (!section.course.published) {
            const isInstructor = currentUser && section.course.instructor.toString() === currentUser._id.toString();
            const isAdmin = currentUser && currentUser.role === 'admin';
            if (!isInstructor && !isAdmin) throw new Error('Unauthorized access');
        }
        return await Lecture.find({ section: sectionId }).sort({ order: 1 });
    },

    async getLecture(lectureId, currentUser = null) {
        const lecture = await Lecture.findById(lectureId).populate({ path: 'section', populate: { path: 'course' } });
        if (!lecture) throw new Error('Lecture not found');
        const course = lecture.section.course;
        if (!course.published || !lecture.isPreview) {
            const isInstructor = currentUser && course.instructor.toString() === currentUser._id.toString();
            const isAdmin = currentUser && currentUser.role === 'admin';
            if (!isInstructor && !isAdmin) {
                if (!currentUser) throw new Error('Unauthorized access');
                if (!await Enrollment.findOne({ user: currentUser._id, course: course._id })) throw new Error('Not enrolled');
            }
        }
        return lecture;
    },

    async createLecture(sectionId, data, currentUser) {
        const section = await Section.findById(sectionId).populate('course');
        if (!section) throw new Error('Section not found');
        const isOwner = section.course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');

        let lectureOrder = data.order;
        if (lectureOrder === undefined) {
            const lastLecture = await Lecture.findOne({ section: sectionId }).sort({ order: -1 });
            lectureOrder = lastLecture ? lastLecture.order + 1 : 0;
        }
        return await Lecture.create({
            title: data.title,
            section: sectionId,
            videoUrl: data.videoUrl,
            notesUrl: data.notesUrl, // Fix: Added notesUrl
            duration: data.duration,
            isPreview: data.isPreview || false,
            order: lectureOrder
        });
    },

    async updateLecture(lectureId, data, currentUser) {
        const lecture = await Lecture.findById(lectureId).populate({ path: 'section', populate: { path: 'course' } });
        if (!lecture) throw new Error('Lecture not found');
        const course = lecture.section.course;
        const isOwner = course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');

        if (data.title !== undefined) lecture.title = data.title;
        if (data.videoUrl !== undefined) lecture.videoUrl = data.videoUrl;
        if (data.notesUrl !== undefined) lecture.notesUrl = data.notesUrl; // Fix: Added notesUrl
        if (data.duration !== undefined) lecture.duration = data.duration;
        if (data.isPreview !== undefined) lecture.isPreview = data.isPreview;
        if (data.order !== undefined) lecture.order = data.order;

        await lecture.save();
        return lecture;
    },

    async deleteLecture(lectureId, currentUser) {
        const lecture = await Lecture.findById(lectureId).populate({ path: 'section', populate: { path: 'course' } });
        if (!lecture) throw new Error('Lecture not found');
        const course = lecture.section.course;
        const isOwner = course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');
        await Lecture.findByIdAndDelete(lectureId);
        return true;
    },

    async reorderLectures(sectionId, lectureIds, currentUser) {
        const section = await Section.findById(sectionId).populate('course');
        if (!section) throw new Error('Section not found');
        const isOwner = section.course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');
        await Promise.all(lectureIds.map((id, index) => Lecture.findByIdAndUpdate(id, { order: index })));
        return await Lecture.find({ section: sectionId }).sort({ order: 1 });
    }
};
