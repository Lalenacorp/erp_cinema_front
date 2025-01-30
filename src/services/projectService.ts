import type { Project, Activite, Depense } from '../types';
import { storage } from '../lib/storage';
import { authService } from './authService';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const data = storage.getData();
    return data.projects.map(project => ({
      ...project,
      budget: {
        ...project.budget,
        montantDepense: project.depenses.reduce((sum, d) => sum + d.montant, 0)
      }
    }));
  },

  async getProjectById(id: string): Promise<Project | null> {
    const data = storage.getData();
    const project = data.projects.find(p => p.id === id);
    if (!project) return null;

    // Calculer le montant total dépensé
    const montantDepense = project.depenses.reduce((sum, d) => sum + d.montant, 0);

    // Mettre à jour les montants dépensés des activités et sous-activités
    const activitesWithExpenses = project.activites.map(activity => {
      const sousActivitesWithExpenses = activity.sousActivites.map(sa => ({
        ...sa,
        montantDepense: project.depenses
          .filter(d => d.sousActiviteId === sa.id)
          .reduce((sum, d) => sum + d.montant, 0)
      }));

      const activityMontantDepense = sousActivitesWithExpenses
        .reduce((sum, sa) => sum + sa.montantDepense, 0);

      return {
        ...activity,
        montantDepense: activityMontantDepense,
        sousActivites: sousActivitesWithExpenses
      };
    });

    return {
      ...project,
      activites: activitesWithExpenses,
      budget: {
        ...project.budget,
        montantDepense
      }
    };
  },

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const data = storage.getData();
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      activites: [],
      depenses: [],
      intervenants: [],
      budget: {
        ...project.budget,
        montantTotal: project.budget.montantTotal || 0,
        montantDepense: 0,
        activites: [],
        calculerTotal: () => project.budget.montantTotal || 0
      }
    };

    data.projects.push(newProject);
    storage.setData(data);
    return newProject;
  },

  async updateProject(id: string, updatedProject: Partial<Project>): Promise<Project> {
    const data = storage.getData();
    const index = data.projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Projet non trouvé');
    }
    
    const currentProject = data.projects[index];
    const montantDepense = currentProject.depenses.reduce((sum, d) => sum + d.montant, 0);

    data.projects[index] = {
      ...currentProject,
      ...updatedProject,
      id,
      budget: {
        ...currentProject.budget,
        ...updatedProject.budget,
        montantDepense
      }
    };
    
    storage.setData(data);
    return data.projects[index];
  },

  async deleteProject(id: string): Promise<void> {
    const data = storage.getData();
    data.projects = data.projects.filter(p => p.id !== id);
    storage.setData(data);
  },

  async addActivity(projectId: string, activity: Omit<Activite, 'id'>): Promise<Activite> {
    const data = storage.getData();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Projet non trouvé');
    }

    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    const newActivity: Activite = {
      ...activity,
      id: crypto.randomUUID(),
      montantDepense: 0,
      createdBy: currentUser,
      createdAt: new Date(),
      sousActivites: activity.sousActivites.map(sa => ({
        ...sa,
        id: crypto.randomUUID(),
        montantDepense: 0,
        createdBy: currentUser,
        createdAt: new Date()
      }))
    };

    project.activites.push(newActivity);
    storage.setData(data);
    return newActivity;
  },

  async addExpense(projectId: string, expense: Omit<Depense, 'id'>): Promise<Depense> {
    const data = storage.getData();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Projet non trouvé');
    }

    const newExpense: Depense = {
      ...expense,
      id: crypto.randomUUID(),
      date: new Date(expense.date)
    };

    project.depenses.push(newExpense);
    
    // Mettre à jour le montant dépensé du projet
    project.budget.montantDepense = project.depenses.reduce((sum, d) => sum + d.montant, 0);

    // Mettre à jour les montants dépensés des activités et sous-activités
    project.activites.forEach(activity => {
      activity.sousActivites.forEach(sa => {
        sa.montantDepense = project.depenses
          .filter(d => d.sousActiviteId === sa.id)
          .reduce((sum, d) => sum + d.montant, 0);
      });

      activity.montantDepense = activity.sousActivites
        .reduce((sum, sa) => sum + sa.montantDepense, 0);
    });

    storage.setData(data);
    return newExpense;
  },

  async updateExpense(projectId: string, expenseId: string, updatedExpense: Depense): Promise<Depense> {
    const data = storage.getData();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Projet non trouvé');
    }

    const expenseIndex = project.depenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) {
      throw new Error('Dépense non trouvée');
    }

    project.depenses[expenseIndex] = {
      ...updatedExpense,
      date: new Date(updatedExpense.date)
    };

    // Mettre à jour le montant dépensé du projet
    project.budget.montantDepense = project.depenses.reduce((sum, d) => sum + d.montant, 0);

    // Mettre à jour les montants dépensés des activités et sous-activités
    project.activites.forEach(activity => {
      activity.sousActivites.forEach(sa => {
        sa.montantDepense = project.depenses
          .filter(d => d.sousActiviteId === sa.id)
          .reduce((sum, d) => sum + d.montant, 0);
      });

      activity.montantDepense = activity.sousActivites
        .reduce((sum, sa) => sum + sa.montantDepense, 0);
    });
    
    storage.setData(data);
    return project.depenses[expenseIndex];
  },

  async deleteExpense(projectId: string, expenseId: string): Promise<void> {
    const data = storage.getData();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Projet non trouvé');
    }

    project.depenses = project.depenses.filter(e => e.id !== expenseId);

    // Mettre à jour le montant dépensé du projet
    project.budget.montantDepense = project.depenses.reduce((sum, d) => sum + d.montant, 0);

    // Mettre à jour les montants dépensés des activités et sous-activités
    project.activites.forEach(activity => {
      activity.sousActivites.forEach(sa => {
        sa.montantDepense = project.depenses
          .filter(d => d.sousActiviteId === sa.id)
          .reduce((sum, d) => sum + d.montant, 0);
      });

      activity.montantDepense = activity.sousActivites
        .reduce((sum, sa) => sum + sa.montantDepense, 0);
    });

    storage.setData(data);
  }
};