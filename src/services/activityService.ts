import axios from 'axios';
import { Activity, CreateActivityRequest, UpdateActivityRequest, SubActivity } from '../types';

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

export const activityService = {
  async listActivities(): Promise<Activity[]> {
    try {
      const { data } = await api.get<Activity[]>('/list_activities/');
      return data;
    } catch (error) {
      return handleError(error, "Failed to fetch activities");
    }
  },

  async createActivity(activityData: CreateActivityRequest): Promise<Activity> {
    try {
      const { data } = await api.post<Activity>('/create_activity/', activityData);
      return data;
    } catch (error) {
      return handleError(error, "Failed to create activity");
    }
  },

  async getActivityDetails(id: number): Promise<Activity> {
    try {
      const { data } = await api.get<Activity>(`/activity/${id}/`);
      return data;
    } catch (error) {
      return handleError(error, "Failed to fetch activity details");
    }
  },

   async updateActivity(id: number, updateData: UpdateActivityRequest): Promise<Activity> {
      try {
        const { data } = await api.patch<Activity>(`/update_activity/${id}/`, updateData);
        return data;
      } catch (error) {
        return handleError(error, "Failed to update activity");
      }
    },



  async deleteActivity(id: number): Promise<void> {
    try {
      await api.delete(`/delete_activity/${id}/`);
    } catch (error) {
      return handleError(error, "Failed to delete activity");
    }
  }
};