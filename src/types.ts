// Ajout des nouvelles interfaces pour la gestion des utilisateurs
export interface Group {
  id: string;
  name: string;
  description: string;
  created_at: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: Date;
}

export interface UserGroup {
  user_id: string;
  group_id: string;
}

export interface GroupPermission {
  group_id: string;
  permission_id: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  groups: Group[];
  permissions: Permission[];
}

export interface SousActivite {
  id: string;
  nom: string;
  description: string;
  montantPrevu: number;
  montantDepense: number;
  dateDebut?: Date;
  dateFin?: Date;
  statut: 'En cours' | 'Terminée' | 'En attente';
  intervenant: Intervenant;
  createdBy: User; // Ajout du créateur
  createdAt: Date; // Ajout de la date de création
}

export interface Activite {
  id: string;
  projetId: string;
  nom: string;
  description: string;
  montantTotal: number;
  montantDepense: number;
  dateDebut?: Date;
  dateFin?: Date;
  statut: 'En cours' | 'Terminée' | 'En attente';
  sousActivites: SousActivite[];
  createdBy: User; // Ajout du créateur
  createdAt: Date; // Ajout de la date de création
}

// ... reste du fichier inchangé