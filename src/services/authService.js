import api from './api';

export const authService = {
  signup: (data) => api.post('/user/signup', data),
  
  signin: (data) => api.post('/user/signin', data),
  
  getProfile: () => api.get('/user/me'),
  
  updateProfile: (data) => api.put('/user/profile', data),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
