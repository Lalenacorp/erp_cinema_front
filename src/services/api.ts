import axios from 'axios';
import { Activity, CreateActivityRequest, UpdateActivityRequest } from '../types/activity';

const API_URL = import.meta.env.VITE_API_URL || 'http://13.38.119.12/api/erp';

const api = axios.create({
  baseURL: API_URL,
});

export const activityService = {
  list: () => api.get<Activity[]>('/list_activities/'),
  
  create: (payload: CreateActivityRequest) => 
    api.post<Activity>('/create_activity/', payload),
  
  getById: (id: number) => 
    api.get<Activity>(`/activity/${id}/`),
  
  update: (id: number, payload: UpdateActivityRequest) =>
    api.patch<Activity>(`/update_activity/${id}/`, payload),
  
  delete: (id: number) =>
    api.delete(`/delete_activity/${id}/`),
};