import { z } from 'zod';
import ApiResponse from '../utils/ApiResponse.js';
import { courseService } from '../services/course.service.js';
import fs from 'fs';
import path from 'path';

const logToFile = (msg) => {
    try {
        const logPath = path.resolve('debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) { }
};

const createCourseSchema = z.object({
    title: z.string().min(3),
    description: z.string().nullish(),
    thumbnail: z.string().nullish(),
    previewVideo: z.string().nullish(),
    price: z.number().min(0).nullish(),
    isFree: z.boolean().nullish(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).nullish(),
    language: z.string().nullish(),
    category: z.string().nullish(),
});

const updateCourseSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().nullish(),
    thumbnail: z.string().nullish(),
    previewVideo: z.string().nullish(),
    price: z.number().min(0).nullish(),
    isFree: z.boolean().nullish(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    language: z.string().nullish(),
    category: z.string().nullish(),
    totalDuration: z.number().nullish(),
});

const handleFileUploads = (req, courseData) => {
    if (req.files) {
        const protocol = req.protocol;
        const host = req.get('host');
        if (req.files.thumbnail && req.files.thumbnail[0]) {
            courseData.thumbnail = `${protocol}://${host}/${req.files.thumbnail[0].path.replace(/\\/g, '/')}`;
        }
        if (req.files.previewVideo && req.files.previewVideo[0]) {
            courseData.previewVideo = `${protocol}://${host}/${req.files.previewVideo[0].path.replace(/\\/g, '/')}`;
        }
    }

    // Safety check: Ensure thumbnail/previewVideo are NOT objects (like File leftovers)
    if (courseData.thumbnail && typeof courseData.thumbnail === 'object') {
        courseData.thumbnail = undefined;
    }
    if (courseData.previewVideo && typeof courseData.previewVideo === 'object') {
        courseData.previewVideo = undefined;
    }
};

const convertTypes = (courseData) => {
    // Price
    if (courseData.price !== undefined && courseData.price !== null) {
        if (typeof courseData.price === 'string') {
            const parsed = parseFloat(courseData.price);
            courseData.price = isNaN(parsed) ? 0 : parsed;
        }
    } else if (courseData.price === '') {
        courseData.price = 0;
    }

    // isFree
    if (courseData.isFree !== undefined && courseData.isFree !== null) {
        if (typeof courseData.isFree === 'string') {
            courseData.isFree = courseData.isFree === 'true';
        }
    }

    // totalDuration
    if (courseData.totalDuration !== undefined && courseData.totalDuration !== null) {
        if (typeof courseData.totalDuration === 'string') {
            const parsed = parseFloat(courseData.totalDuration);
            courseData.totalDuration = isNaN(parsed) ? 0 : parsed;
        }
    }
};

export const createCourse = async (req, res) => {
    try {
        console.log('--- INCOMING CREATE COURSE REQUEST ---');
        console.log('Content-Type:', req.headers['content-type']);
        console.log('User:', req.user?._id);

        const courseData = { ...req.body };
        handleFileUploads(req, courseData);
        convertTypes(courseData);

        console.log('Course Data Prepared for Validation:', JSON.stringify(courseData, null, 2));
        const validatedData = createCourseSchema.parse(courseData);

        const course = await courseService.createCourse(validatedData, req.user._id);
        return ApiResponse.created('Course created successfully', course).send(res);
    } catch (error) {
        logToFile(`!!! COURSE CREATE ERROR !!!: ${error.message}`);
        if (error instanceof z.ZodError) {
            console.error('!!! COURSE ZOD VALIDATION FAILED !!!', error.issues);
            const firstError = error.issues[0];
            const detailMsg = firstError ? ` (${firstError.path.join('.')}: ${firstError.message})` : '';
            return ApiResponse.badRequest(`Validation failed${detailMsg}`, error.issues).send(res);
        }
        if (error.message === 'Course with this title already exists') return ApiResponse.conflict(error.message).send(res);
        console.error('Create course error:', error);
        return ApiResponse.serverError(`Server Error: ${error.message}`).send(res);
    }
};

export const getAllCourses = async (req, res) => {
    try {
        const result = await courseService.getAllCourses(req.query);
        return ApiResponse.success('Courses fetched successfully', {
            courses: result.courses, debug: result.debug, pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages }
        }).send(res);
    } catch (error) {
        console.error('Get courses error:', error);
        return ApiResponse.serverError('Failed to fetch courses').send(res);
    }
};

export const getCourse = async (req, res) => {
    try {
        const course = await courseService.getCourse(req.params.id, req.user);
        return ApiResponse.success('Course fetched successfully', course).send(res);
    } catch (error) {
        if (error.message === 'Course not found') return ApiResponse.notFound('Course not found').send(res);
        if (error.message === 'Course not published') return ApiResponse.forbidden('Course not published').send(res);
        console.error('Get course error:', error);
        return ApiResponse.serverError('Failed to fetch course').send(res);
    }
};

export const getInstructorCourses = async (req, res) => {
    try {
        const courses = await courseService.getInstructorCourses(req.user._id);
        return ApiResponse.success('Instructor courses fetched successfully', courses).send(res);
    } catch (error) {
        console.error('Get instructor courses error:', error);
        return ApiResponse.serverError('Failed to fetch courses').send(res);
    }
};

export const updateCourse = async (req, res) => {
    try {
        console.log('--- INCOMING UPDATE COURSE REQUEST ---');
        console.log('ID:', req.params.id);
        console.log('Content-Type:', req.headers['content-type']);

        const courseData = { ...req.body };
        handleFileUploads(req, courseData);
        convertTypes(courseData);

        console.log('Update Data Prepared for Validation:', JSON.stringify(courseData, null, 2));
        const validatedData = updateCourseSchema.parse(courseData);
        const course = await courseService.updateCourse(req.params.id, validatedData, req.user);
        return ApiResponse.success('Course updated successfully', course).send(res);
    } catch (error) {
        logToFile(`!!! COURSE UPDATE ERROR !!!: ${error.message}`);
        if (error instanceof z.ZodError) {
            console.error('Update Zod Error:', error.issues);
            const firstError = error.issues[0];
            const detailMsg = firstError ? ` (${firstError.path.join('.')}: ${firstError.message})` : '';
            return ApiResponse.badRequest(`Validation failed${detailMsg}`, error.issues).send(res);
        }
        if (error.message === 'Course not found') return ApiResponse.notFound('Course not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('You are not authorized to update this course').send(res);
        if (error.message === 'Course with this title already exists') return ApiResponse.conflict(error.message).send(res);
        console.error('Update course error:', error);
        return ApiResponse.serverError(`Server Error: ${error.message}`).send(res);
    }
};

export const deleteCourse = async (req, res) => {
    try {
        await courseService.deleteCourse(req.params.id, req.user);
        return ApiResponse.success('Course deleted successfully').send(res);
    } catch (error) {
        if (error.message === 'Course not found') return ApiResponse.notFound('Course not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('You are not authorized to delete this course').send(res);
        console.error('Delete course error:', error);
        return ApiResponse.serverError('Failed to delete course').send(res);
    }
};

export const togglePublish = async (req, res) => {
    try {
        const result = await courseService.togglePublish(req.params.id, req.user);
        return ApiResponse.success(`Course ${result.published ? 'published' : 'unpublished'} successfully`, result).send(res);
    } catch (error) {
        if (error.message === 'Course not found') return ApiResponse.notFound('Course not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('You are not authorized to update this course').send(res);
        console.error('Toggle publish error:', error);
        return ApiResponse.serverError('Failed to update course status').send(res);
    }
};
