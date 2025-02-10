export interface Group {
  id: string; // UUID
  name: string;
  permissions: string;
}

export interface Permission {
  id: string; // UUID
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string; // Format ISO 8601
}

export interface User {
  id: string; // UUID
  username: string;
  email: string;
  groups: Group[];
  permissions: Permission[];
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
