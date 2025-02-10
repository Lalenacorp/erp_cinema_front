import { api } from '../lib/api'; // Assurez-vous que cette importation est correcte
import type { User, AuthTokens, LoginRequest, Group } from '../types';
import { jwtDecode } from 'jwt-decode';  // Correction de l'importation de jwt-decode

export const authService = {
  // Récupérer le token d'authentification (Access token) depuis le localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Récupérer le refresh token depuis le localStorage
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  // Stocker les tokens d'authentification dans le localStorage
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem('auth_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  },

  // Supprimer les tokens du localStorage
  removeTokens(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },

  // Connexion utilisateur
  async login(credentials: LoginRequest): Promise<AuthTokens> {
    const data = {
      email: credentials.email,
      password: credentials.password,
    };

    try {
      const response = await api.post(`/api/login/`, data);
      console.log('Réponse de l\'API:', response);

      if (response && response.access && response.refresh) {
        this.setTokens(response);
        return response;
      } else {
        throw new Error('Les tokens d\'accès et de rafraîchissement sont manquants.');
      }
    } catch (error) {
      console.error('Erreur de login:', error);
      throw error;
    }
  },

  // Rafraîchir le token d'accès
  async refreshAccessToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token manquant');
    }

    try {
      const response = await api.post('/api/token/refresh/', { refresh: refreshToken });

      if (response && response.access) {
        this.setTokens(response);
        return response;
      } else {
        throw new Error('Token d\'accès manquant dans la réponse de rafraîchissement.');
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  },

  // Déconnexion utilisateur
  logout(): void {
    this.removeTokens();
    window.location.href = '/login';
  },

  // Récupérer l'utilisateur courant à partir du token
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token || this.isTokenExpired(token)) return null;

      const decoded: any = jwtDecode(token);
      return { 
        id: decoded.user_id, 
        username: decoded.username, 
        email: decoded.email,
        groups: decoded.groups || [],
        permissions: decoded.permissions || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  // Vérifier si le token est expiré
  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      return true;
    }
  },

  // Demander une réinitialisation du mot de passe
  async requestPasswordReset(email: string): Promise<void> {
    try {
      if (!email) {
        throw new Error("L'adresse email est requise.");
      }

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailRegex.test(email)) {
        throw new Error("Adresse email invalide.");
      }

      await api.post('/api/forgot-password/', { email });
      console.log('Demande de réinitialisation du mot de passe envoyée avec succès.');
    } catch (error: any) {
      const errorMessage = error.response ? error.response.data.message : error.message || 'Une erreur est survenue';
      console.error('Erreur lors de la demande de réinitialisation du mot de passe:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Obtenir la liste de tous les utilisateurs
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/api/users/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // Obtenir un utilisateur spécifique par ID
  async getUserById(userId: number): Promise<User> {
    try {
      const response = await api.get(`/api/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
// authService.ts
async createUser(data: { email: string; groupIds: string[] }): Promise<User> {
  try {
    const response = await api.post('/api/users/register/', data);  // Assurez-vous que l'endpoint est correct
    return response.data; // Retourne les données de l'utilisateur créé
  } catch (error) {
    console.error('Erreur lors de l\'invitation de l\'utilisateur:', error);
    throw error;
  }
},

  // Mettre à jour un utilisateur existant (PATCH)
  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.patch(`/api/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  async deleteUser(userId: number): Promise<void> {
    try {
      await api.delete(`/api/users/${userId}/`);
      console.log(`Utilisateur ${userId} supprimé avec succès.`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  // Récupérer la liste de tous les groupes
  async getAllGroups(): Promise<Group[]> {
    try {
      const response = await api.get('/api/groups/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes:', error);
      throw error;
    }
  },

  // Mettre à jour les groupes d'un utilisateur
async updateUserGroups(data: { userId: string; groupIds: string[] }): Promise<void> {
  try {
    // Utilisez l'objet pour mettre à jour les groupes de l'utilisateur
    await api.patch(`/api/users/${data.userId}/groups/`, { groupIds: data.groupIds });  // Assurez-vous que l'endpoint est correct
  } catch (error) {
    console.error('Erreur lors de la mise à jour des groupes de l\'utilisateur:', error);
    throw error;
  }
}

};
