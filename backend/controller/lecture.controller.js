import { z } from 'zod';
import ApiResponse from '../utils/ApiResponse.js';
import { lectureService } from '../services/lecture.service.js';
import fs from 'fs';
import path from 'path';

const logToFile = (msg) => {
    try {
        const logPath = path.resolve('debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) { }
};

const createLectureSchema = z.object({
    title: z.string().min(3),
    videoUrl: z.string().optional(),
    notesUrl: z.string().optional(),
    duration: z.number().min(0).optional(),
    isPreview: z.boolean().optional(),
    order: z.number().int().min(0).optional()
});

const updateLectureSchema = z.object({
    title: z.string().min(3).optional(),
    videoUrl: z.string().optional(),
    notesUrl: z.string().optional(),
    duration: z.number().min(0).optional(),
    isPreview: z.boolean().optional(),
    order: z.number().int().min(0).optional()
});

const reorderLectureSchema = z.object({ lectureIds: z.array(z.string()).min(1) });

export const getSectionLectures = async (req, res) => {
    try {
        const lectures = await lectureService.getSectionLectures(req.params.sectionId, req.user);
        return ApiResponse.success('Lectures fetched successfully', lectures).send(res);
    } catch (error) {
        if (error.message === 'Section not found') return ApiResponse.notFound('Section not found').send(res);
        if (error.message === 'Unauthorized access') return ApiResponse.forbidden('Unauthorized access').send(res);
        console.error('Get lectures error:', error);
        return ApiResponse.serverError('Failed to fetch lectures').send(res);
    }
};

export const getLecture = async (req, res) => {
    try {
        const lecture = await lectureService.getLecture(req.params.id, req.user);
        return ApiResponse.success('Lecture fetched successfully', lecture).send(res);
    } catch (error) {
        if (error.message === 'Lecture not found') return ApiResponse.notFound('Lecture not found').send(res);
        if (error.message === 'Not enrolled') return ApiResponse.forbidden('You must be enrolled to access this lecture').send(res);
        if (error.message === 'Unauthorized access') return ApiResponse.forbidden('Unauthorized access').send(res);
        console.error('Get lecture error:', error);
        return ApiResponse.serverError('Failed to fetch lecture').send(res);
    }
};

const processFiles = (req, data) => {
    if (req.files) {
        const protocol = req.protocol;
        const host = req.get('host');
        if (req.files.video && req.files.video[0]) {
            data.videoUrl = `${protocol}://${host}/${req.files.video[0].path.replace(/\\/g, '/')}`;
        }
        if (req.files.notes && req.files.notes[0]) {
            data.notesUrl = `${protocol}://${host}/${req.files.notes[0].path.replace(/\\/g, '/')}`;
        }
    }
};

const convertTypes = (data) => {
    if (typeof data.duration === 'string') {
        const parsed = parseFloat(data.duration);
        data.duration = isNaN(parsed) ? undefined : parsed;
    }
    if (typeof data.isPreview === 'string') data.isPreview = data.isPreview === 'true';
    if (typeof data.order === 'string') {
        const parsed = parseInt(data.order, 10);
        data.order = isNaN(parsed) ? undefined : parsed;
    }
};

export const createLecture = async (req, res) => {
    try {
        logToFile(`LECTURE_POST: User=${req.user?._id}, Section=${req.params.sectionId}, Body=${JSON.stringify(req.body)}, Files=${Object.keys(req.files || {})}`);

        const lectureData = { ...req.body };
        console.log('--- LECTURE CREATE REQUEST ---');
        console.log('req.body:', JSON.stringify(req.body, null, 2));
        console.log('req.files fields:', Object.keys(req.files || {}));

        processFiles(req, lectureData);
        convertTypes(lectureData);

        console.log('Final data for validation:', JSON.stringify(lectureData, null, 2));

        const validatedData = createLectureSchema.parse(lectureData);
        const lecture = await lectureService.createLecture(req.params.sectionId, validatedData, req.user);
        return ApiResponse.created('Lecture created successfully', lecture).send(res);
    } catch (error) {
        logToFile(`!!! LECTURE CREATE ERROR !!!: ${error.message}`);
        if (error instanceof z.ZodError) {
            console.error('!!! LECTURE ZOD VALIDATION FAILED !!!', error.issues);
            const firstError = error.issues[0];
            const detailMsg = firstError ? ` (${firstError.path.join('.')}: ${firstError.message})` : '';
            return ApiResponse.badRequest(`Validation failed${detailMsg}`, {
                issues: error.issues,
                receivedData: req.body,
                fileKeys: Object.keys(req.files || {})
            }).send(res);
        }
        if (error.message === 'Section not found') return ApiResponse.notFound('Section not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('Only the course instructor can create lectures').send(res);

        console.error('Create lecture error:', error);
        return ApiResponse.serverError(`Server Error: ${error.message}`, {
            stack: error.stack,
            body: req.body,
            files: Object.keys(req.files || {})
        }).send(res);
    }
};

export const updateLecture = async (req, res) => {
    try {
        const lectureData = { ...req.body };
        processFiles(req, lectureData);
        convertTypes(lectureData);

        const validatedData = updateLectureSchema.parse(lectureData);
        const lecture = await lectureService.updateLecture(req.params.id, validatedData, req.user);
        return ApiResponse.success('Lecture updated successfully', lecture).send(res);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('!!! LECTURE UPDATE ZOD VALIDATION FAILED !!!', error.issues);
            const firstError = error.issues[0];
            const detailMsg = firstError ? ` (${firstError.path.join('.')}: ${firstError.message})` : '';
            return ApiResponse.badRequest(`Validation failed${detailMsg}`, error.issues).send(res);
        }
        if (error.message === 'Lecture not found') return ApiResponse.notFound('Lecture not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('Only the course instructor can update lectures').send(res);
        console.error('Update lecture error:', error);
        return ApiResponse.serverError('Failed to update lecture').send(res);
    }
};

export const deleteLecture = async (req, res) => {
    try {
        await lectureService.deleteLecture(req.params.id, req.user);
        return ApiResponse.success('Lecture deleted successfully').send(res);
    } catch (error) {
        if (error.message === 'Lecture not found') return ApiResponse.notFound('Lecture not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('Only the course instructor can delete lectures').send(res);
        console.error('Delete lecture error:', error);
        return ApiResponse.serverError('Failed to delete lecture').send(res);
    }
};

export const reorderLectures = async (req, res) => {
    try {
        const { lectureIds } = reorderLectureSchema.parse(req.body);
        const updatedLectures = await lectureService.reorderLectures(req.params.sectionId, lectureIds, req.user);
        return ApiResponse.success('Lectures reordered successfully', updatedLectures).send(res);
    } catch (error) {
        if (error instanceof z.ZodError) return ApiResponse.badRequest('Validation failed', error.issues).send(res);
        if (error.message === 'Section not found') return ApiResponse.notFound('Section not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('Only the course instructor can reorder lectures').send(res);
        console.error('Reorder lectures error:', error);
        return ApiResponse.serverError('Failed to reorder lectures').send(res);
    }
};
