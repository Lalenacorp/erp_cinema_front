import { Activity } from './activity';

export type ProjectStatus = "prepa" | "pre-prod" | "prod" | "post-prod";

export interface Project {
  id: number;
  name: string;
  project_manager: string,
  description: string | null;
  created_at: string;
  updated_at: string;
  status?: ProjectStatus;
  budget: string;
  current_expenses: string | null;
  budget_gap: string | null;
  currency: string;
  exchange_rate: string;
  managed_by: number;
  activites: Activity[];
  started_at: string; // date de début
  achieved_at: string; // date de fin
}

export interface CreateProjectRequest {
  name: string;
  description: string | null;
  status?: ProjectStatus;
  budget: string;
  currency: string;
  exchange_rate: string;
  managed_by: number;

  started_at: string; // date de début
  achieved_at: string; // date de fin
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  budget: string;
  status?: ProjectStatus;
  currency?: string;
  exchange_rate?: string;
  started_at?: string;
  achieved_at?: string;
}

export interface ListProjectsResponse {
  projects: Project[];
}

export type CreateProjectResponse = Project;
export type UpdateProjectResponse = Project;
export type ProjectDetailResponse = Project;
export type DeleteProjectResponse = { status: number };