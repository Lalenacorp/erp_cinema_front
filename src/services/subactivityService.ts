import axios from 'axios';
import { SubActivity, CreateSubActivityRequest, UpdateSubActivityRequest } from '../types';

const BASE_URL = 'http://13.38.119.12/api/erp';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const handleError = (error: any, customMessage: string): never => {
  const message = error.response?.data?.message || error.message || customMessage;
  throw new Error(message);
};

export const subactivityService = {
  async listSubActivities(): Promise<SubActivity[]> {
    try {
      const { data } = await api.get<SubActivity[]>('/list_subactivities/');
      return data;
    } catch (error) {
      return handleError(error, "Failed to fetch subactivities");
    }
  },

  async createSubActivity(subactivityData: CreateSubActivityRequest): Promise<SubActivity> {
    try {
      const { data } = await api.post<SubActivity>('/create_subactivity/', subactivityData);
      return data;
    } catch (error) {
      return handleError(error, "Failed to create subactivity");
    }
  },

  async getSubActivityDetails(id: number): Promise<SubActivity> {
    try {
      const { data } = await api.get<SubActivity>(`/subactivity/${id}/`);
      return data;
    } catch (error) {
      return handleError(error, "Failed to fetch subactivity details");
    }
  },

  async updateSubActivity(id: number, updateData: UpdateSubActivityRequest): Promise<SubActivity> {
    try {
      const { data } = await api.patch<SubActivity>(`/update_subactivity/${id}/`, updateData);
      return data;
    } catch (error) {
      return handleError(error, "Failed to update subactivity");
    }
  },

  async deleteSubActivity(id: number): Promise<void> {
    try {
      await api.delete(`/delete_subactivity/${id}/`);
    } catch (error) {
      return handleError(error, "Failed to delete subactivity");
    }
  }
};