import { Router } from 'express';
import {
  createCourse,
  getAllCourses,
  getCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
  togglePublish,
} from '../controller/course.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const courseRouter = Router();

// Public routes
courseRouter.get('/', getAllCourses);
courseRouter.get('/:id', getCourse);

// Instructor routes
courseRouter.post('/',
  authenticate,
  authorize('instructor', 'admin'),
  upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'previewVideo', maxCount: 1 }]),
  createCourse
);
courseRouter.get('/instructor/my-courses', authenticate, authorize('instructor', 'admin'), getInstructorCourses);
courseRouter.put('/:id',
  authenticate,
  authorize('instructor', 'admin'),
  upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'previewVideo', maxCount: 1 }]),
  updateCourse
);
courseRouter.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteCourse);
courseRouter.patch('/:id/publish', authenticate, authorize('instructor', 'admin'), togglePublish);

export default courseRouter;
