import axios from 'axios';

// Ensure baseURL ends with a trailing slash so relative paths (e.g., 'listings/') resolve under /api/
const rawBase = import.meta.env.VITE_API_BASE_URL || '';
let baseURL = rawBase && rawBase.trim().length > 0 ? (rawBase.endsWith('/') ? rawBase : rawBase + '/') : '/api/';
if (!rawBase && !import.meta.env.DEV) {
  // In production, set VITE_API_BASE_URL to your backend API root (e.g., https://api.example.com/api/)
  // Falling back to same-origin /api/ will only work if your hosting rewrites /api to your backend.
  console.warn('[api] VITE_API_BASE_URL is not set; defaulting to /api/. Configure a rewrite or set the env for production.');
}

const apiClient = axios.create({
  baseURL,
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
  return apiClient.get('categories/');
};

// Generic listings fetcher supporting filters, ordering, pagination
// params can include: page, page_size, category, min_price, max_price, negotiable, is_featured, min_rating, ordering, search, location
export const fetchListings = (params = {}, options = {}) => {
  const { signal } = options;
  return apiClient.get('listings/', { params, signal });
};

// Facets for listings given current filters (counts per category, negotiable, featured, price ranges)
export const fetchListingsFacets = (params = {}) => {
  return apiClient.get('listings/facets/', { params });
};

export const fetchListingById = (id) => {
  return apiClient.get(`listings/${id}/`);
};

// Related listings (simple heuristic: same category, exclude current id, first page, adjustable limit)
export const fetchRelatedListings = (categoryId, excludeId, limit = 12) => {
  const params = { category: categoryId, page: 1, page_size: limit + 1 };
  return apiClient.get('listings/', { params }).then(res => {
    let results = res.data.results || res.data;
    if (Array.isArray(results)) {
      results = results.filter(r => r.id !== excludeId).slice(0, limit);
    } else {
      results = [];
    }
    return results;
  });
};

export const registerUser = (userData) => {
  return apiClient.post('auth/register/', userData);
};
export const loginUser = (credentials) => {
  return apiClient.post('auth/login/', credentials);
};

// Current authenticated user (expects a backend endpoint returning id & username)
export const fetchCurrentUser = () => {
  return apiClient.get('auth/me/');
};

export const createListing = (formData) => {
  return apiClient.post('listings/', formData);
};

// Specs metadata for dynamic form fields per category
export const fetchSpecsMetadata = (categoryName) => {
  return apiClient.get('specs-metadata/', { params: { category: categoryName } });
};

// Location suggestions (basic substring search)
export const fetchLocationSuggestions = (q) => {
  return apiClient.get('locations-suggest/', { params: { q } });
};

// Fetch full distinct locations list (capped server-side)
export const fetchAllLocations = () => {
  return apiClient.get('locations-suggest/', { params: { all: 1 } });
};

export const fetchUserListings = (config = {}) => {
  return apiClient.get('profile/my-listings/', config);
};

export const updateListing = (id, formData) => {
  return apiClient.patch(`listings/${id}/`, formData);
};

// Quick toggle owner actions
export const quickToggleListing = (id, action) => {
  return apiClient.post(`listings/${id}/quick-toggle/`, { action });
};

// Append a single image to an existing listing via PATCH (multipart)
export const appendListingImage = (id, file, onUploadProgress) => {
  const fd = new FormData();
  fd.append('uploaded_images', file);
  return apiClient.patch(`listings/${id}/`, fd, { onUploadProgress });
};

export const deleteListing = (id) => {
  return apiClient.delete(`listings/${id}/`);
};

export const updateProfile = (data) => {
  return apiClient.patch('auth/me/', data);
};

export const fetchDashboardStats = () => {
  return apiClient.get('dashboard/stats/');
};

export const startConversation = (listingId) => {
  return apiClient.post('conversations/start/', { listing_id: listingId });
};

// Fetches all of a user's conversations
export const fetchConversations = () => {
  return apiClient.get('conversations/');
};

// Fetches the details and messages of a single conversation
export const fetchConversationById = (conversationId) => {
  return apiClient.get(`conversations/${conversationId}/`);
};

// Sends a new message in a conversation
export const sendMessage = (conversationId, content) => {
  return apiClient.post(`conversations/${conversationId}/messages/`, { content });
};

// Sends a message with optional file attachments via multipart/form-data
export const sendMessageMultipart = (conversationId, { content = '', files = [] } = {}, config = {}) => {
  const fd = new FormData();
  // Allow blank content when only attachments are sent
  if (typeof content === 'string') fd.append('content', content);
  if (files && files.length) {
    for (const f of files) {
      fd.append('uploaded_files', f);
    }
  }
  return apiClient.post(`conversations/${conversationId}/messages/`, fd, config);
};

// Paginated fetch of messages for a conversation
// page (number) is optional (defaults to 1). Backend pagination param is 'page'.
export const fetchConversationMessages = (conversationId, page = 1) => {
  return apiClient.get(`conversations/${conversationId}/messages/`, { params: { page } });
};

// Marks all unread messages in a conversation as read
export const markConversationRead = (conversationId) => {
  return apiClient.post(`conversations/${conversationId}/mark-read/`);
};

// Export a conventional page size constant (keep in sync with backend pagination page size if needed)
export const MESSAGE_PAGE_SIZE = 20;

// Marketplace stats (listings/users/categories counts)
export const fetchStats = () => {
  return apiClient.get('stats/');
};

// Helper to build ordering strings (prefix with - for descending)
export const buildOrdering = ({ newestFirst, priceAsc, priceDesc, ratingDesc }) => {
  if (priceAsc) return 'price';
  if (priceDesc) return '-price';
  if (ratingDesc) return '-rating';
  if (newestFirst) return '-created_at';
  return '-created_at';
};

// Infinite scroll convenience (returns next page when called)
export const fetchListingsPage = async (page, baseParams = {}, options = {}) => {
  const params = { page, ...baseParams };
  const res = await fetchListings(params, options);
  return res.data; // expecting DRF pagination structure if pagination added on backend
};

export default apiClient;