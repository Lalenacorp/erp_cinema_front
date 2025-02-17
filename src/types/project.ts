import { Activity } from './activity';

export type ProjectStatus = "prepa" | "pre-prod" | "prod" | "post-prod";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  dateDebut: string;
  status?: ProjectStatus;
  budget: string;
  current_expenses: string | null;
  budget_gap: string | null;
  currency: string;
  exchange_rate: string;
  managed_by: number;
  activites: Activity[]; // Array of activities
}

export interface CreateProjectRequest {
  name: string;
  budget: number;
  status: ProjectStatus;
  managed_by: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface ListProjectsResponse {
  projects: Project[];
}

export type CreateProjectResponse = Project;
export type UpdateProjectResponse = Project;
export type ProjectDetailResponse = Project;
export type DeleteProjectResponse = { status: number };