import axios from 'axios';
import { api } from '@/config/api';
import { Automation, CreateAutomationPayload, TestRunPayload } from '@/types/automation';

const axiosInstance = axios.create({
  baseURL: api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const automationService = {
  // Get all automations
  async getAll(): Promise<Automation[]> {
    const response = await axiosInstance.get('/api/automations');
    return response.data;
  },

  // Get single automation by ID
  async getById(id: string): Promise<Automation> {
    const response = await axiosInstance.get(`/api/automations/${id}`);
    return response.data;
  },

  // Create new automation
  async create(data: CreateAutomationPayload): Promise<Automation> {
    const response = await axiosInstance.post('/api/automations', data);
    return response.data;
  },

  // Update automation
  async update(id: string, data: Partial<CreateAutomationPayload>): Promise<Automation> {
    const response = await axiosInstance.put(`/api/automations/${id}`, data);
    return response.data;
  },

  // Delete automation
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/api/automations/${id}`);
  },

  // Test run automation
  async testRun(id: string, data: TestRunPayload): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/api/automations/${id}/test`, data);
    return response.data;
  },
};
