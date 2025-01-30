import { api } from '../lib/api';
import type { User, Group } from '../types';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  user_id: string;
  exp: number;
}

// Données de test pour l'authentification
const TEST_USER = {
  id: '1',
  username: 'Admin',
  email: 'ndiayemaguina@gmail.com',
  groups: [
    {
      id: '1',
      name: 'Administrateurs',
      description: 'Accès complet à toutes les fonctionnalités',
      created_at: new Date()
    }
  ],
  permissions: []
};

const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMSIsImV4cCI6MTkzMDI1NTI0OX0.6D8SYXmXDqQvuEKUXP3Rt6PGs6qP3yQqzSbwGsqNxzE';

export const authService = {
  // Gestion des tokens
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  // Vérification de l'expiration du token
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  // Authentification
  async login(email: string, password: string): Promise<void> {
    // Mode test : vérification des identifiants en dur
    if (email === TEST_USER.email && password === 'passer') {
      this.setToken(TEST_TOKEN);
      return;
    }

    throw new Error('Email ou mot de passe incorrect');
  },

  async logout(): Promise<void> {
    this.removeToken();
    window.location.href = '/login';
  },

  // Gestion des utilisateurs
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    // En mode test, retourner l'utilisateur de test
    return TEST_USER;
  },

  async getAllUsers(): Promise<User[]> {
    // En mode test, retourner une liste avec l'utilisateur de test
    return [TEST_USER];
  },

  async getAllGroups(): Promise<Group[]> {
    // En mode test, retourner les groupes de test
    return [
      {
        id: '1',
        name: 'Administrateurs',
        description: 'Accès complet à toutes les fonctionnalités',
        created_at: new Date()
      },
      {
        id: '2',
        name: 'Chefs de projet',
        description: 'Gestion complète des projets',
        created_at: new Date()
      },
      {
        id: '3',
        name: 'Membres',
        description: 'Accès en lecture aux projets et activités',
        created_at: new Date()
      }
    ];
  },

  async updateUserGroups(userId: string, groupIds: string[]): Promise<void> {
    // En mode test, simuler la mise à jour
    console.log('Mise à jour des groupes pour l\'utilisateur', userId, groupIds);
  },

  async updateProfile(profile: { username: string; email: string }): Promise<void> {
    // En mode test, simuler la mise à jour
    console.log('Mise à jour du profil', profile);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // En mode test, simuler le changement de mot de passe
    if (currentPassword !== 'passer') {
      throw new Error('Mot de passe actuel incorrect');
    }
    console.log('Mot de passe changé');
  },

  async requestPasswordReset(email: string): Promise<void> {
    // En mode test, vérifier si c'est l'utilisateur de test
    if (email === TEST_USER.email) {
      console.log('Email de réinitialisation envoyé à', email);
      return;
    }
    throw new Error('Utilisateur non trouvé');
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // En mode test, simuler la réinitialisation
    console.log('Mot de passe réinitialisé avec le token', token);
  }
};