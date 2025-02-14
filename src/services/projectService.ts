import { Project, Activity, SubActivity } from '../types';
import { api } from '../lib/api'; // Assurez-vous que cette importation soit utilisée correctement.

export const projectService = {

  baseUrl: 'http://13.38.119.12', // L'URL de base de l'API

  // Récupère le token de la personne connectée
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  
  // Liste tous les projets
  async getProjects(): Promise<Project[]> {
    const token = this.getToken();

    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/list_projects/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération des projets");
    }

    const data = await response.json();

    // Vérification que data est un tableau
    if (!Array.isArray(data)) {
      throw new Error("La réponse de l'API n'est pas un tableau de projets");
    }

    // Traiter et retourner les projets
    return data.map((project: any) => ({
      ...project,
      budget: parseFloat(project.budget) || 0,  // Convertir budget en nombre
      current_expenses: project.current_expenses ? parseFloat(project.current_expenses) : 0,  // Gérer current_expenses
      budget_gap: project.budget_gap ? parseFloat(project.budget_gap) : 0,  // Gérer budget_gap
      description: project.description || "",  // Si description est null, la remplacer par une chaîne vide
    }));
  },

  // Crée un projet
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/create_project/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: project.name,
        budget: project.budget,
        status: project.status,
        managed_by: project.managed_by,
      })
    });

    if (!response.ok) {
      throw new Error("Échec de la création du projet");
    }

    const newProject = await response.json();
    return {
      ...newProject,
      budget: parseFloat(newProject.budget),
      current_expenses: newProject.current_expenses ? parseFloat(newProject.current_expenses) : null,
      budget_gap: newProject.budget_gap ? parseFloat(newProject.budget_gap) : null,
    };
  },

  // Récupère les détails d'un projet par son ID
  async getProjectDetails(id: string | number): Promise<Project> {
    const token = this.getToken();
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/project/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération des détails du projet");
    }

    const data = await response.json();
    return {
      ...data,
      budget: {
        montantTotal: parseFloat(data.budget) || 0,
        montantDepense: data.current_expenses ? parseFloat(data.current_expenses) : 0,
        ecart: data.budget_gap ? parseFloat(data.budget_gap) : 0,
      },
      subActivities: [], // Initialize empty array for subactivities
    };
  },

  // Met à jour un projet
  async updateProject(id: number, updatedData: Partial<Project>): Promise<Project> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/project/update_project/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Échec de la mise à jour du projet");
    }

    const updatedProject = await response.json();
    return {
      ...updatedProject,
      budget: parseFloat(updatedProject.budget),
      current_expenses: updatedProject.current_expenses ? parseFloat(updatedProject.current_expenses) : null,
      budget_gap: updatedProject.budget_gap ? parseFloat(updatedProject.budget_gap) : null,
    };
  },

  // Supprime un projet
  async deleteProject(id: number): Promise<void> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/delete_project/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Échec de la suppression du projet");
    }
  },

  // Crée une nouvelle activité pour un projet spécifique
  async createActivity(projectId: number, name: string, managedBy: number): Promise<Activity> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/project/${projectId}/create_activity/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        project: projectId,
        name: name,
        managed_by: managedBy,
      })
    });

    if (!response.ok) {
      throw new Error("Échec de la création de l'activité");
    }

    const newActivity = await response.json();
    return newActivity;
  },

  // Liste toutes les sous-activités d'une activité
   async listSubActivities(activityId: number): Promise<SubActivity[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/list_subactivities/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération des sous-activités");
    }

    const data = await response.json();
    
    // Ensure data is an array before mapping
    if (!Array.isArray(data)) {
      console.error("Unexpected API response format:", data);
      return [];
    }

    return data.map((subactivity: any) => ({
      ...subactivity,
      amount_estimated: parseFloat(subactivity.amount_estimated) || 0,
      amount_spent: subactivity.amount_spent ? parseFloat(subactivity.amount_spent) : 0,
      subactivity_gap: subactivity.subactivity_gap ? parseFloat(subactivity.subactivity_gap) : 0,
    }));
  },

  // Crée une sous-activité
  async createSubActivity(activityId: number, name: string, amountEstimated: number): Promise<SubActivity> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/create_subactivity/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        activity: activityId,
        name: name,
        amount_estimated: amountEstimated,
      })
    });

    if (!response.ok) {
      throw new Error("Échec de la création de la sous-activité");
    }

    const newSubActivity = await response.json();
    return newSubActivity;
  },

  // Récupère les détails d'une sous-activité
  async getSubActivityDetails(id: number): Promise<SubActivity> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/subactivity/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération des détails de la sous-activité");
    }

    const data = await response.json();
    return data;
  },

  // Met à jour une sous-activité
  async updateSubActivity(id: number, updatedData: Partial<SubActivity>): Promise<SubActivity> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/update_subactivity/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Échec de la mise à jour de la sous-activité");
    }

    const updatedSubActivity = await response.json();
    return updatedSubActivity;
  },

  // Supprime une sous-activité
  async deleteSubActivity(id: number): Promise<void> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`${this.baseUrl}/api/erp/delete_subactivity/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Échec de la suppression de la sous-activité");
    }
  }
};
