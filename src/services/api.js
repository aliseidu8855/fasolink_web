import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchCategories = () => {
  return apiClient.get('/categories/');
};

// New function to fetch listings with optional query parameters
export const fetchListings = (params = {}) => {
  return apiClient.get('/listings/', { params });
};

export const fetchListingById = (id) => {
  return apiClient.get(`/listings/${id}/`);
};

export const registerUser = (userData) => {
  return apiClient.post('/auth/register/', userData);
};
export const loginUser = (credentials) => {
  return apiClient.post('/auth/login/', credentials);
};

export const createListing = (formData) => {
  // formData must be a FormData object
  return apiClient.post('/listings/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

