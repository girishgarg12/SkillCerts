import api from './api';

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  
  addToWishlist: (courseId) => api.post('/wishlist/add', { courseId }),
  
  removeFromWishlist: (courseId) => api.post('/wishlist/remove', { courseId }),
};
