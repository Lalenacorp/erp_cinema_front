import axios from 'axios';
import { 
  Project, 
  Activity, 
  SubActivity, 
  CreateProjectRequest,
  UpdateProjectRequest 
} from '../types';

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
  console.error('API Error:', error.response || error);
  const message = error.response?.data?.message || error.message || customMessage;
  throw new Error(message);
};

export const projectService = {
  async getProjects(): Promise<Project[]> {
    try {
      const { data } = await api.get<Project[]>('/list_projects/');
      return data;
    } catch (error) {
      return handleError(error, "Impossible de récupérer la liste des projets");
    }
  },

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    try {
      const { data } = await api.post<Project>('/create_project/', projectData);
      return data;
    } catch (error) {
      return handleError(error, "Impossible de créer le projet");
    }
  },

  async getProjectDetails(id: string | number): Promise<Project> {
    try {
      const { data } = await api.get<Project>(`/project/${id}/`);
      return data;
    } catch (error) {
      return handleError(error, "Impossible de récupérer les détails du projet");
    }
  },

  async updateProject(id: number, updatedData: UpdateProjectRequest): Promise<Project> {
    try {
      const { data } = await api.patch<Project>(`/update_project/${id}/`, updatedData);
      return data;
    } catch (error) {
      return handleError(error, "Impossible de mettre à jour le projet");
    }
  },

  async deleteProject(id: number): Promise<void> {
    try {
      await api.delete(`/delete_project/${id}/`);
    } catch (error) {
      return handleError(error, "Impossible de supprimer le projet");
    }
  },

  async listSubActivities(activityId: number): Promise<SubActivity[]> {
    try {
      const { data } = await api.get<SubActivity[]>('/list_subactivities/');
      return data;
    } catch (error) {
      return handleError(error, "Impossible de récupérer les sous-activités");
    }
  }
};