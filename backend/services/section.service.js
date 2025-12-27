import { Section } from '../model/section.model.js';
import { Lecture } from '../model/lecture.model.js';
import { Course } from '../model/course.model.js';

export const sectionService = {
    async getCourseSections(courseId, currentUser = null) {
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');
        if (!course.published) {
            const instructorId = course.instructor?._id ? course.instructor._id.toString() : course.instructor?.toString();
            const currentUserId = currentUser?._id?.toString();

            console.log('--- CURRICULUM ACCESS CHECK ---');
            console.log(`Course: ${course._id}`);
            console.log(`Instructor ID: [${instructorId}] (from course)`);
            console.log(`Current User ID: [${currentUserId}] (from request)`);

            const isInstructor = currentUser && instructorId === currentUserId;
            const isAdmin = currentUser && currentUser.role === 'admin';

            console.log(`Match? ${isInstructor}`);

            if (!isInstructor && !isAdmin) {
                console.log('!!! ACCESS DENIED !!!');
                throw new Error(`Course not published yet. Instructor: ${instructorId}, Current: ${currentUserId}`);
            }
        }
        const sections = await Section.find({ course: courseId }).sort({ order: 1 });
        return await Promise.all(sections.map(async (section) => {
            const lectures = await Lecture.find({ section: section._id }).sort({ order: 1 });
            return { ...section.toObject(), lectures, lectureCount: lectures.length };
        }));
    },

    async getSection(sectionId, currentUser = null) {
        const section = await Section.findById(sectionId).populate('course');
        if (!section) throw new Error('Section not found');
        if (!section.course.published) {
            const isInstructor = currentUser && section.course.instructor.toString() === currentUser._id.toString();
            const isAdmin = currentUser && currentUser.role === 'admin';
            if (!isInstructor && !isAdmin) throw new Error('Unauthorized access');
        }
        const lectures = await Lecture.find({ section: sectionId }).sort({ order: 1 });
        return { ...section.toObject(), lectures };
    },

    async createSection(courseId, data, currentUser) {
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');
        const isOwner = course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');

        let sectionOrder = data.order;
        if (sectionOrder === undefined) {
            const lastSection = await Section.findOne({ course: courseId }).sort({ order: -1 });
            sectionOrder = lastSection ? lastSection.order + 1 : 0;
        }
        return await Section.create({ title: data.title, course: courseId, order: sectionOrder });
    },

    async updateSection(sectionId, data, currentUser) {
        const section = await Section.findById(sectionId).populate('course');
        if (!section) throw new Error('Section not found');
        const isOwner = section.course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');
        if (data.title !== undefined) section.title = data.title;
        if (data.order !== undefined) section.order = data.order;
        await section.save();
        return section;
    },

    async deleteSection(sectionId, currentUser) {
        const section = await Section.findById(sectionId).populate('course');
        if (!section) throw new Error('Section not found');
        const isOwner = section.course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');
        await Lecture.deleteMany({ section: sectionId });
        await Section.findByIdAndDelete(sectionId);
        return true;
    },

    async reorderSections(courseId, sectionIds, currentUser) {
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');
        const isOwner = course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');
        await Promise.all(sectionIds.map((id, index) => Section.findByIdAndUpdate(id, { order: index })));
        return await Section.find({ course: courseId }).sort({ order: 1 });
    }
};
