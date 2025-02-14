export interface Group {
  id: string; // UUID
  name: string;
  permissions: Permission[]; // Correction du type pour être un tableau d'objets Permission
}




export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: string;
  
}

// Réponses API
export interface ApiResponse {
  message: string;
  permissions_data?: Permission[];
}


export interface User {
  id: string; // UUID
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string
  groups: Group[];
 // permissions: Permission[];
}

export interface AuthTokens {
  refresh: string;
  access: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  new_password: string;
  confirm_password: string;
}

export interface PasswordChange {
  old_password: string;
  new_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LogoutRequest {
  refresh: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export type StatutActivite = 'En cours' | 'Terminée' | 'En attente';



// Modèle pour un Projet
export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string; // Date ISO 8601
  updated_at: string; // Date ISO 8601
  dateDebut: string;
  status?: "prepa" | "pre-prod" | "prod" | "post-prod";
  budget: string; // Montant en format string (pour les chiffres de type '3000000.00')
  current_expenses: string | null; // Dépenses actuelles, ou null si non spécifié
  budget_gap: string | null; // Écart de budget, ou null si non spécifié
  currency: string; // Devise, exemple: 'Euro'
  exchange_rate: string; // Taux de change, exemple: '0.00'
  managed_by: number; // ID de l'utilisateur qui gère le projet
  activites: Activity[]; // Liste des activités
}

// Modèle pour la création d'un projet
export interface CreateProjectRequest {
  name: string;
  budget: number; // Montant du budget
  status: "prepa" | "pre-prod" | "prod" | "post-prod";
  managed_by: number; // ID de l'utilisateur qui gère le projet
}

// Modèle pour la réponse après la création d'un projet
export interface CreateProjectResponse extends Project {}

// Modèle pour la mise à jour d'un projet
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: "prepa" | "pre-prod" | "prod" | "post-prod";
  
}



// Modèle pour la réponse après la mise à jour d'un projet
export interface UpdateProjectResponse extends Project {}

// Modèle pour la réponse à la suppression d'un projet
export interface DeleteProjectResponse {
  status: number; // 204 NO CONTENT
}

// Modèle pour la réponse de la liste des projets
export interface ListProjectsResponse {
  projects: Project[];  // Contient un tableau d'objets Project
}

// Modèle pour la réponse d'un projet spécifique
export interface ProjectDetailResponse extends Project {}

// Modèle pour une Activité
export interface Activity {
  id: number;
  activity_subactivity: any[]; // Liste des sous-activités (pour l'instant vide)
  activity_manager: string; // Responsable de l'activité
  name: string;
  description: string | null; // Description de l'activité
  created_at: string; // Date de création de l'activité
  updated_at: string; // Date de mise à jour de l'activité
  total_amount_estimated: string | null; // Montant total estimé
  total_amount_spent: string | null; // Montant total dépensé
  activity_gap: string | null; // Écart entre estimé et dépensé
  project: number; // ID du projet auquel l'activité appartient
  managed_by: number; // ID de l'utilisateur qui gère l'activité
}

export interface SubActivity {
  id: number;
  activity: number; // ID de l'activité à laquelle la sous-activité est associée
  name: string;
  description: string;
  amount_estimated: number; // Montant estimé pour la sous-activité
  amount_spent: number;     // Montant dépensé jusqu'à présent pour la sous-activité
  subactivity_gap: number;  // Différence entre le montant estimé et le montant dépensé
  created_at: string;       // Date de création de la sous-activité
  updated_at: string;       // Dernière date de mise à jour
  dateDebut?: string; // Format ISO 8601
  dateFin?: string;   // Format ISO 8601

}