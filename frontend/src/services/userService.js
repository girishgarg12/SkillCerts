import api from './api';

export const userService = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.patch('/user/profile', data),
    changePassword: (data) => api.post('/user/change-password', data),
    getAllInstructors: () => api.get('/user/instructors'),
    getInstructor: (id) => api.get(`/user/instructors/${id}`),
};
