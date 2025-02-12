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

export interface SousActivite {
  id: string; // UUID
  nom: string;
  description: string;
  montantPrevu: number;
  montantDepense: number;
  dateDebut?: string; // Format ISO 8601
  dateFin?: string;   // Format ISO 8601
  statut: StatutActivite;
  createdBy: User;
  createdAt: string; // Format ISO 8601
}

export interface Activite {
  id: string; // UUID
  projetId: string; // UUID
  nom: string;
  description: string;
  montantTotal: number;
  montantDepense: number;
  dateDebut?: string; // Format ISO 8601
  dateFin?: string;   // Format ISO 8601
  statut: StatutActivite;
  sousActivites: SousActivite[];
  createdBy: User;
  createdAt: string; // Format ISO 8601
}
