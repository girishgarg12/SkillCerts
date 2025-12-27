import { z } from 'zod';
import ApiResponse from '../utils/ApiResponse.js';
import { sectionService } from '../services/section.service.js';
import fs from 'fs';
import path from 'path';

const logToFile = (msg) => {
    try {
        const logPath = path.resolve('debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) { }
};

const createSectionSchema = z.object({ title: z.string().min(3), order: z.number().int().min(0).optional() });
const updateSectionSchema = z.object({ title: z.string().min(3).optional(), order: z.number().int().min(0).optional() });
const reorderSectionSchema = z.object({ sectionIds: z.array(z.string()).min(1) });

export const getCourseSections = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        console.log(`[DEBUG] GET_SECTIONS Request - Course: ${req.params.courseId}, User: ${req.user?._id}, Auth: ${authHeader ? 'Present' : 'Missing'}`);

        const sections = await sectionService.getCourseSections(req.params.courseId, req.user);
        return ApiResponse.success('Sections fetched successfully', sections).send(res);
    } catch (error) {
        logToFile(`!!! GET_SECTIONS ERROR !!!: ${error.message} - User: ${req.user?._id}`);
        if (error.message === 'Course not found') return ApiResponse.notFound('Course not found').send(res);
        if (error.message.startsWith('Course not published yet')) {
            if (!req.user) {
                return ApiResponse.unauthorized('Authentication required to view draft curriculum').send(res);
            }
            return ApiResponse.forbidden(error.message, {
                userId: req.user?._id,
                email: req.user?.email
            }).send(res);
        }
        console.error('Get sections error:', error);
        return ApiResponse.serverError(`Server Error: ${error.message}`).send(res);
    }
};

export const getSection = async (req, res) => {
    try {
        const section = await sectionService.getSection(req.params.id, req.user);
        return ApiResponse.success('Section fetched successfully', section).send(res);
    } catch (error) {
        if (error.message === 'Section not found') return ApiResponse.notFound('Section not found').send(res);
        if (error.message === 'Unauthorized access') return ApiResponse.forbidden('Unauthorized access').send(res);
        console.error('Get section error:', error);
        return ApiResponse.serverError('Failed to fetch section').send(res);
    }
};

export const createSection = async (req, res) => {
    try {
        const validatedData = createSectionSchema.parse(req.body);
        const section = await sectionService.createSection(req.params.courseId, validatedData, req.user);
        return ApiResponse.created('Section created successfully', section).send(res);
    } catch (error) {
        if (error instanceof z.ZodError) return ApiResponse.badRequest('Validation failed', error.issues).send(res);
        if (error.message === 'Course not found') return ApiResponse.notFound('Course not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('Only the course instructor can create sections').send(res);
        console.error('Create section error:', error);
        return ApiResponse.serverError('Failed to create section').send(res);
    }
};

export const updateSection = async (req, res) => {
    try {
        const validatedData = updateSectionSchema.parse(req.body);
        const section = await sectionService.updateSection(req.params.id, validatedData, req.user);
        return ApiResponse.success('Section updated successfully', section).send(res);
    } catch (error) {
        if (error instanceof z.ZodError) return ApiResponse.badRequest('Validation failed', error.issues).send(res);
        if (error.message === 'Section not found') return ApiResponse.notFound('Section not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('Only the course instructor can update sections').send(res);
        console.error('Update section error:', error);
        return ApiResponse.serverError('Failed to update section').send(res);
    }
};

export const deleteSection = async (req, res) => {
    try {
        await sectionService.deleteSection(req.params.id, req.user);
        return ApiResponse.success('Section and its lectures deleted successfully').send(res);
    } catch (error) {
        if (error.message === 'Section not found') return ApiResponse.notFound('Section not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('Only the course instructor can delete sections').send(res);
        console.error('Delete section error:', error);
        return ApiResponse.serverError('Failed to delete section').send(res);
    }
};

export const reorderSections = async (req, res) => {
    try {
        const { sectionIds } = reorderSectionSchema.parse(req.body);
        const updatedSections = await sectionService.reorderSections(req.params.courseId, sectionIds, req.user);
        return ApiResponse.success('Sections reordered successfully', updatedSections).send(res);
    } catch (error) {
        if (error instanceof z.ZodError) return ApiResponse.badRequest('Validation failed', error.issues).send(res);
        if (error.message === 'Course not found') return ApiResponse.notFound('Course not found').send(res);
        if (error.message === 'Unauthorized') return ApiResponse.forbidden('Only the course instructor can reorder sections').send(res);
        console.error('Reorder sections error:', error);
        return ApiResponse.serverError('Failed to reorder sections').send(res);
    }
};
