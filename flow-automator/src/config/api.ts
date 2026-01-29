// API configuration - Update this URL to point to your Express backend
// Backend default port is 5001 (5000 is reserved by a Windows system process on this machine)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

export const api = {
  baseUrl: API_BASE_URL,
  endpoints: {
    automations: `${API_BASE_URL}/api/automations`,
    automation: (id: string) => `${API_BASE_URL}/api/automations/${id}`,
    testRun: (id: string) => `${API_BASE_URL}/api/automations/${id}/test`,
  },
};
