import { Course } from '../model/course.model.js';
import { User } from '../model/user.model.js';

const generateSlug = (title) => title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').trim();

export const courseService = {
    async createCourse(data, instructorId) {
        const slug = generateSlug(data.title);
        if (await Course.findOne({ slug })) throw new Error('Course with this title already exists');
        const course = await Course.create({ ...data, slug, instructor: instructorId });
        return await Course.findById(course._id).populate('instructor', 'name email avatar').populate('category', 'name slug');
    },

    async getAllCourses(filters) {
        const { page = 1, limit = 10, level, category, isFree, search, instructor } = filters;
        const query = { published: true };
        if (level) query.level = level;
        if (category) query.category = category;
        if (isFree !== undefined) query.isFree = isFree === 'true';
        if (instructor) query.instructor = instructor;
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            const instructors = await User.find({ name: searchRegex }).select('_id');
            const instructorIds = instructors.map(i => i._id);
            query.$or = [{ title: searchRegex }, { description: searchRegex }];
            if (instructorIds.length > 0) query.$or.push({ instructor: { $in: instructorIds } });
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [courses, total] = await Promise.all([
            Course.find(query).populate('instructor', 'name email avatar').populate('category', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            Course.countDocuments(query),
        ]);
        return { courses, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)), debug: { query, count: courses.length } };
    },

    async getCourse(identifier, currentUser = null) {
        const query = identifier.match(/^[0-9a-fA-F]{24}$/) ? { _id: identifier } : { slug: identifier };
        const course = await Course.findOne(query).populate('instructor', 'name email avatar bio').populate('category', 'name slug');
        if (!course) throw new Error('Course not found');
        if (!course.published) {
            const isInstructor = currentUser && course.instructor._id.toString() === currentUser._id.toString();
            const isAdmin = currentUser && currentUser.role === 'admin';
            if (!isInstructor && !isAdmin) throw new Error('Course not published');
        }
        return course;
    },

    async getInstructorCourses(instructorId) {
        return await Course.find({ instructor: instructorId }).populate('category', 'name slug').sort({ createdAt: -1 });
    },

    async updateCourse(courseId, data, currentUser) {
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');
        const isOwner = course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');

        if (data.title) {
            const newSlug = generateSlug(data.title);
            if (await Course.findOne({ slug: newSlug, _id: { $ne: courseId } })) throw new Error('Course with this title already exists');
            data.slug = newSlug;
        }
        return await Course.findByIdAndUpdate(courseId, { $set: data }, { new: true, runValidators: true }).populate('instructor', 'name email avatar').populate('category', 'name slug');
    },

    async deleteCourse(courseId, currentUser) {
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');
        const isOwner = course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');
        await Course.findByIdAndDelete(courseId);
        return true;
    },

    async togglePublish(courseId, currentUser) {
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');
        const isOwner = course.instructor.toString() === currentUser._id.toString();
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Unauthorized');
        course.published = !course.published;
        await course.save();
        return { published: course.published };
    }
};
