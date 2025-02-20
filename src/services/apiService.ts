import { Project, Activity, SubActivity, UpdateActivityRequest } from '../types';

export const apiService = {
  baseUrl: 'http://13.38.119.12',

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  createHeaders(): HeadersInit {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },

  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${this.baseUrl}/api/erp/list_projects/`, {
      headers: this.createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération des projets");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("La réponse de l'API n'est pas un tableau de projets");
    }

    return data.map((project: any) => ({
      ...project,
      budget: parseFloat(project.budget) || 0,
      current_expenses: project.current_expenses ? parseFloat(project.current_expenses) : 0,
      budget_gap: project.budget_gap ? parseFloat(project.budget_gap) : 0,
      description: project.description || "",
    }));
  },

 

  async getProjectDetails(id: string | number): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/api/erp/project/${id}/`, {
      headers: this.createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération des détails du projet");
    }

    const data = await response.json();
    return {
      ...data,
      subActivities: [],
    };
  },

  async updateProject(id: number, updatedData: Partial<Project>): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}/api/erp/update_project/${id}/`, {
        method: 'PATCH',
        headers: this.createHeaders(),
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec de la mise à jour du projet: ${errorText}`);
      }
  
      const updatedProject = await response.json();
      return {
        ...updatedProject,
        name: updatedProject.name,
        budget: parseFloat(updatedProject.budget),
        current_expenses: updatedProject.current_expenses ? parseFloat(updatedProject.current_expenses) : null,
        budget_gap: updatedProject.budget_gap ? parseFloat(updatedProject.budget_gap) : null,
      };
    } catch (error) {
      console.error("❌ Erreur API updateProject:", error);
      throw error;
    }
  }
,  

  async deleteProject(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/erp/delete_project/${id}/`, {
      method: 'DELETE',
      headers: this.createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Échec de la suppression du projet");
    }
  },

  async listActivities(): Promise<Activity[]> {
    const response = await fetch(`${this.baseUrl}/api/erp/list_activities/`, {
      headers: this.createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération des activités");
    }

    return response.json();
  },

  async createActivity(projectId: number, name: string, managedBy: number): Promise<Activity> {
    const response = await fetch(`${this.baseUrl}/api/erp/create_activity/`, {
      method: 'POST',
      headers: this.createHeaders(),
      body: JSON.stringify({
        project: projectId,
        name: name,
        managed_by: managedBy,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Échec de la création de l'activité: ${errorText}`);
    }

    return response.json();
  },

  async getActivityDetails(id: number): Promise<Activity> {
    const response = await fetch(`${this.baseUrl}/api/erp/activity/${id}/`, {
      headers: this.createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération des détails de l'activité");
    }

    return response.json();
  },

  async updateActivity(id: number, updatedData: UpdateActivityRequest): Promise<Activity> {
    const response = await fetch(`${this.baseUrl}/api/erp/update_activity/${id}/`, {
      method: 'PATCH',
      headers: this.createHeaders(),
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Échec de la mise à jour de l'activité");
    }

    return response.json();
  },

  async deleteActivity(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/erp/delete_activity/${id}/`, {
      method: 'DELETE',
      headers: this.createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Échec de la suppression de l'activité");
    }
  },

  async listSubActivities(): Promise<SubActivity[]> {
    const response = await fetch(`${this.baseUrl}/api/erp/list_subactivities/`, {
      headers: this.createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération des sous-activités");
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error("Format de réponse API inattendu:", data);
      return [];
    }

    return data.map((subactivity: any) => ({
      ...subactivity,
      amount_estimated: parseFloat(subactivity.amount_estimated) || 0,
      amount_spent: subactivity.amount_spent ? parseFloat(subactivity.amount_spent) : 0,
      subactivity_gap: subactivity.subactivity_gap ? parseFloat(subactivity.subactivity_gap) : 0,
    }));
  },

  async createSubActivity(activityId: number, name: string, amountEstimated: number): Promise<SubActivity> {
    const response = await fetch(`${this.baseUrl}/api/erp/create_subactivity/`, {
      method: 'POST',
      headers: this.createHeaders(),
      body: JSON.stringify({
        activity: activityId,
        name: name,
        amount_estimated: amountEstimated,
      })
    });

    if (!response.ok) {
      throw new Error("Échec de la création de la sous-activité");
    }

    return response.json();
  },

  async getSubActivityDetails(id: number): Promise<SubActivity> {
    const response = await fetch(`${this.baseUrl}/api/erp/subactivity/${id}/`, {
      headers: this.createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération des détails de la sous-activité");
    }

    return response.json();
  },

  async updateSubActivity(id: number, updatedData: Partial<SubActivity>): Promise<SubActivity> {
    try {
      // Ne garder que les champs name et description pour la mise à jour
      const updatePayload = {
        name: updatedData.name,
        description: updatedData.description
      };

      const response = await fetch(`${this.baseUrl}/api/erp/update_subactivity/${id}/`, {
        method: 'PATCH',
        headers: this.createHeaders(),
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec de la mise à jour de la sous-activité: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Update sub-activity error:', error);
      throw error;
    }
  },

  async deleteSubActivity(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/erp/delete_subactivity/${id}/`, {
      method: 'DELETE',
      headers: this.createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Échec de la suppression de la sous-activité");
    }
  }
};