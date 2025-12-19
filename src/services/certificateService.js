import api from './api';

export const certificateService = {
  getMyCertificates: () => api.get('/certificates/my'),
  
  getCertificate: (id) => api.get(`/certificates/${id}`),
  
  verifyCertificate: (certificateId) => 
    api.get(`/certificates/verify/${certificateId}`),
};
