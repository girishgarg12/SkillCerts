import api from './api';

export const courseService = {
  getAllCourses: (params) => api.get('/courses', { params }),

  getCourse: (id) => api.get(`/courses/${id}`),

  searchCourses: (search) => api.get('/courses', { params: { search } }),

  getCoursesByCategory: (categoryId) =>
    api.get('/courses', { params: { category: categoryId } }),

  createCourse: (data) => {
    // Check if data is FormData to set proper headers being careful with boundary
    const isFormData = data instanceof FormData;
    return api.post('/courses', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
  },
};
