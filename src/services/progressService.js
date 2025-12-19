import api from './api';

export const progressService = {
  getProgress: (courseId) => api.get(`/progress/${courseId}`),
  
  markLectureComplete: (lectureId) => 
    api.post('/progress/complete', { lectureId }),
};
