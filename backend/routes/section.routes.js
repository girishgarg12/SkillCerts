import { Router } from 'express';
import {
  getCourseSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} from '../controller/section.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware.js';

const sectionRouter = Router();

// Public/Student routes
sectionRouter.get('/course/:courseId', optionalAuthenticate, getCourseSections);
sectionRouter.get('/:id', optionalAuthenticate, getSection);

// Instructor/Admin routes
sectionRouter.use(authenticate, authorize('instructor', 'admin'));
sectionRouter.post('/course/:courseId', createSection);
sectionRouter.put('/:id', updateSection);
sectionRouter.delete('/:id', deleteSection);
sectionRouter.patch('/course/:courseId/reorder', reorderSections);

export default sectionRouter;
