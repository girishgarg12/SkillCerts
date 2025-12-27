import { z } from 'zod';
import { categoryService } from '../services/category.service.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
});

/**
 * Get all categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return ApiResponse.success('Categories fetched successfully', categories).send(res);
  } catch (error) {
    console.error('Get categories error:', error);
    return ApiResponse.serverError('Failed to fetch categories').send(res);
  }
};

/**
 * Get category by ID or slug
 */
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategory(id);
    return ApiResponse.success('Category fetched successfully', category).send(res);
  } catch (error) {
    if (error.message === 'Category not found') {
      return ApiResponse.notFound('Category not found').send(res);
    }
    console.error('Get category error:', error);
    return ApiResponse.serverError('Failed to fetch category').send(res);
  }
};

/**
 * Create new category (Admin only)
 */
export const createCategory = async (req, res) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(validatedData);
    return ApiResponse.created('Category created successfully', category).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(res);
    }
    if (error.message.includes('already exists')) {
      return ApiResponse.conflict(error.message).send(res);
    }
    console.error('Create category error:', error);
    return ApiResponse.serverError('Failed to create category').send(res);
  }
};

/**
 * Update category (Admin only)
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateCategorySchema.parse(req.body);
    const updatedCategory = await categoryService.updateCategory(id, validatedData);
    return ApiResponse.success('Category updated successfully', updatedCategory).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(res);
    }
    if (error.message === 'Category not found') {
      return ApiResponse.notFound('Category not found').send(res);
    }
    if (error.message.includes('already exists')) {
      return ApiResponse.conflict(error.message).send(res);
    }
    console.error('Update category error:', error);
    return ApiResponse.serverError('Failed to update category').send(res);
  }
};

/**
 * Delete category (Admin only)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    return ApiResponse.success('Category deleted successfully').send(res);
  } catch (error) {
    if (error.message === 'Category not found') {
      return ApiResponse.notFound('Category not found').send(res);
    }
    console.error('Delete category error:', error);
    return ApiResponse.serverError('Failed to delete category').send(res);
  }
};
