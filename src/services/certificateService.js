import api from './api';

export const certificateService = {
  getMyCertificates: () => api.get('/certificates/my'),
  
  getCertificate: (courseId) => api.get(`/certificates/course/${courseId}`),
  
  generateCertificate: (courseId) => api.post(`/certificates/generate/${courseId}`),
  
  // Get certificate data for frontend rendering
  viewCertificate: (courseId) => api.get(`/certificates/view/${courseId}`),
  
  verifyCertificate: (certificateId) => 
    api.get(`/certificates/verify/${certificateId}`),
};
