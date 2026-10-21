/**
 * HackBridge Frontend API Client
 * Connects to the Express REST API with token authorization & error handling.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('hackbridge_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    demoLogin: (role) => request('/auth/demo-login', { method: 'POST', body: { role } }),
    getMe: () => request('/auth/me'),
  },

  // Students
  students: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/students?${q}`);
    },
    getById: (id) => request(`/students/${id}`),
    update: (id, data) => request(`/students/${id}`, { method: 'PUT', body: data }),
    getCompleteness: (id) => request(`/students/${id}/completeness`),
  },

  // Teams
  teams: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/teams?${q}`);
    },
    getById: (id) => request(`/teams/${id}`),
    create: (data) => request('/teams', { method: 'POST', body: data }),
    apply: (teamId, data) => request(`/teams/${teamId}/apply`, { method: 'POST', body: data }),
    decideApplication: (teamId, appId, decision) =>
      request(`/teams/${teamId}/applications/${appId}/decision`, { method: 'POST', body: { decision } }),
    getCompleteness: (teamId) => request(`/teams/${teamId}/completeness`),
    getRecommendedTeammates: (teamId, limit = 8) =>
      request(`/teams/${teamId}/recommended-teammates?limit=${limit}`),
  },

  // Hackathons
  hackathons: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/hackathons?${q}`);
    },
    getById: (id) => request(`/hackathons/${id}`),
    create: (data) => request('/hackathons', { method: 'POST', body: data }),
    getAnnouncements: (id) => request(`/hackathons/${id}/announcements`),
    createAnnouncement: (id, data) => request(`/hackathons/${id}/announcements`, { method: 'POST', body: data }),
    getCompatibility: (hackathonId, teamId) =>
      request(`/hackathons/${hackathonId}/compatibility/${teamId}`),
    apply: (hackathonId, data) => request(`/hackathons/${hackathonId}/apply`, { method: 'POST', body: data }),
  },

  // Mentors
  mentors: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/mentors?${q}`);
    },
    getById: (id) => request(`/mentors/${id}`),
    getMatchForTeam: (teamId) => request(`/mentors/match/${teamId}`),
    requestMentorship: (mentorId, data) =>
      request(`/mentors/${mentorId}/request`, { method: 'POST', body: data }),
    decideRequest: (requestId, decision) =>
      request(`/mentors/requests/${requestId}/decision`, { method: 'POST', body: { decision } }),
  },

  // Smart Matching Pool
  matchingPool: {
    join: (data) => request('/matching-pool/join', { method: 'POST', body: data }),
    leave: (studentId) => request('/matching-pool/leave', { method: 'POST', body: { student_id: studentId } }),
    getStatus: (studentId) => request(`/matching-pool/status/${studentId}`),
    getAll: () => request('/matching-pool/all'),
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
  },

  // Analytics
  analytics: {
    getOverview: () => request('/analytics/overview'),
    getColleges: () => request('/analytics/colleges'),
    getDomains: () => request('/analytics/domains'),
    getSkills: () => request('/analytics/skills'),
  },

  // DDBMS
  ddbms: {
    getCluster: () => request('/ddbms/cluster'),
    runQuery: (queryType, params = {}) =>
      request('/ddbms/query', { method: 'POST', body: { query_type: queryType, params } }),
  },

  // Admin
  admin: {
    getUsers: () => request('/admin/users'),
    updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),
    getStats: () => request('/admin/stats'),
  },

  // Health
  health: () => request('/health'),
};
