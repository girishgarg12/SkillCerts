import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'instructor']).optional(),
  interests: z.array(z.string()).optional(),
});

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Sign up new user
 */
export const signup = async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const result = await authService.signup(validatedData);
    return ApiResponse.created('User registered successfully', result).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.errors).send(res);
    }
    if (error.message === 'Email already registered') {
      return ApiResponse.conflict('Email already registered').send(res);
    }
    console.error('Signup error:', error);
    return ApiResponse.serverError('Failed to register user').send(res);
  }
};

/**
 * Sign in existing user
 */
export const signin = async (req, res) => {
  try {
    const validatedData = signinSchema.parse(req.body);
    const result = await authService.signin(validatedData);
    return ApiResponse.success('Login successful', result).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.errors).send(res);
    }
    if (error.message === 'Invalid email or password') {
      return ApiResponse.unauthorized('Invalid email or password').send(res);
    }
    console.error('Signin error:', error);
    return ApiResponse.serverError('Failed to login').send(res);
  }
};

/**
 * Get current user profile
 */
export const getMe = async (req, res) => {
  try {
    const result = await authService.getMe(req.user);
    return ApiResponse.success('User profile fetched', result).send(res);
  } catch (error) {
    console.error('Get me error:', error);
    return ApiResponse.serverError('Failed to fetch user profile').send(res);
  }
};
