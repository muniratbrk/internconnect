const rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();
const BASE_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : (rawApiUrl === '/' ? '/api' : `${rawApiUrl.replace(/\/$/, '')}/api`);

export function getAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const backendOrigin = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : '';
  return `${backendOrigin}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('internconnect_token');
  const headers = { ...options.headers };

  // Don't set Content-Type if uploading FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.message || response.statusText || 'An unexpected error occurred';
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  verifyEmail: () => request('/auth/verify-email', { method: 'POST' }),
  forgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Student Profile
  getStudentProfile: () => request('/students/profile'),
  updateStudentProfile: (payload) => request('/students/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  uploadResume: (formData) => request('/students/resume', { method: 'POST', body: formData }),
  uploadAvatar: (formData) => request('/students/avatar', { method: 'POST', body: formData }),
  getPublicStudent: (id) => request(`/students/${id}`),

  // Company Profile
  getCompanyProfile: () => request('/companies/profile'),
  updateCompanyProfile: (payload) => request('/companies/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  uploadCompanyLogo: (formData) => request('/companies/logo', { method: 'POST', body: formData }),
  listCompanies: (params = '') => request(`/companies${params}`),
  getPublicCompany: (id) => request(`/companies/${id}`),

  // Internships
  listInternships: (queryString = '') => request(`/internships${queryString}`),
  getRecommendedInternships: () => request('/internships/recommended'),
  getInternship: (id) => request(`/internships/${id}`),
  createInternship: (payload) => request('/internships', { method: 'POST', body: JSON.stringify(payload) }),
  updateInternship: (id, payload) => request(`/internships/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteInternship: (id) => request(`/internships/${id}`, { method: 'DELETE' }),
  getCompanyPostings: () => request('/internships/company/my-postings'),

  // Applications
  applyInternship: (payload) => request('/applications', { method: 'POST', body: JSON.stringify(payload) }),
  getStudentApplications: () => request('/applications/student'),
  getInternshipApplicants: (internshipId) => request(`/applications/internship/${internshipId}`),
  updateApplicationStatus: (id, payload) => request(`/applications/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
  getApplication: (id) => request(`/applications/${id}`),

  // Messaging
  getConversations: () => request('/messages/conversations'),
  getMessages: (conversationId) => request(`/messages/conversations/${conversationId}`),
  sendMessage: (payload) => request('/messages', { method: 'POST', body: JSON.stringify(payload) }),
  startConversation: (payload) => request('/messages/start', { method: 'POST', body: JSON.stringify(payload) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  getUnreadCount: () => request('/notifications/unread-count'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Admin
  getAdminAnalytics: () => request('/admin/analytics'),
  getAdminCompanies: () => request('/admin/companies'),
  toggleCompanyVerification: (id, payload) => request(`/admin/companies/${id}/verify`, { method: 'PUT', body: JSON.stringify(payload) }),
  getAdminPostings: () => request('/admin/postings'),
  updatePostingModeration: (id, payload) => request(`/admin/postings/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
  getAdminUsers: () => request('/admin/users'),

  // Reviews
  createReview: (payload) => request('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  getCompanyReviews: (companyId) => request(`/reviews/company/${companyId}`),
};
