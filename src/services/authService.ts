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
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        username: decoded.username, 
        email: decoded.email,
        password: decoded.password,
        groups: decoded.groups || [],
      //  permissions: decoded.permissions || []
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
// Exemple de récupération des utilisateurs
async getAllUsers(): Promise<User[]> {
  try {
    const token = this.getToken();
    console.log("🔑 Token utilisé :", token);

    if (!token) {
      throw new Error("❌ Token manquant !");
    }

    const response = await api.get('/api/users/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Log the complete response
    console.log("📡 Response complète:", response);

    // Try to get data from different possible response formats
    let users;
    if (response.data) {
      users = response.data;
    } else if (Array.isArray(response)) {
      users = response;
    } else if (typeof response === 'string') {
      try {
        users = JSON.parse(response);
      } catch (e) {
        console.error("❌ Impossible de parser la réponse comme JSON:", e);
      }
    } else {
      users = response; // Try using the response directly
    }

    console.log("📡 Données extraites:", users);

    // Validate the data
    if (!users) {
      throw new Error("❌ Impossible d'extraire les données de la réponse");
    }

    if (!Array.isArray(users)) {
      throw new Error(`⚠️ Les données ne sont pas un tableau (type reçu: ${typeof users})`);
    }

    // Validate the structure of each user object
    const validUsers = users.every(user => 
      typeof user === 'object' &&
      user !== null &&
      'id' in user &&
      'username' in user &&
      'email' in user
    );

    if (!validUsers) {
      throw new Error("⚠️ Certains objets utilisateur ne sont pas valides");
    }

    console.log("✅ Données des utilisateurs validées:", users);
    return users;
  } catch (error: any) {
    console.error("❌ Erreur API détaillée:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      rawResponse: error.response
    });
    throw error;
  }
},
  // Obtenir un utilisateur spécifique par ID
  async getUserById(id: string): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      const response = await fetch(`http://13.38.119.12/api/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Ajoute le token dans les en-têtes
        }
      });
      console.log("📡 Token complète : ", token);
      // Log pour inspecter la réponse
      console.log("📡 Réponse API complète : ", response);

      // Vérifiez ici si le code de statut HTTP est correct (200 OK)
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // On tente de parser la réponse JSON
      const data = await response.json();

      // Log pour inspecter les données
      console.log("Données de l'utilisateur récupérées : ", data);

      // Vérifiez si les données sont valides (par exemple : ID de l'utilisateur)
      if (data && data.id) {
        return data;  // Si les données sont valides, renvoyer l'utilisateur
      } else {
        throw new Error('Utilisateur non trouvé ou données invalides');
      }
    } catch (error) {
      //console.error('❌ Erreur API :', error.message || error);
      throw new Error('Données invalides ou utilisateur non trouvé');
    }
  },


  // Créer un nouvel utilisateur avec tous les champs nécessaires
  async createUser(data: {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
  }): Promise<User> {
    try {
      console.log("Données envoyées à l'API :", data);

      const response = await api.post('/api/user/register/', {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        password: data.password,
      });

      console.log("Réponse de l'API :", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la création de l'utilisateur:", error.response?.data || error.message);
      throw error;
    }
  },

 // Mettre à jour un utilisateur existant
// Mettre à jour un utilisateur existant
async updateUser(id: string, userData: Partial<User>): Promise<User> {
  try {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("❌ Token manquant !");
    }

    const response = await api.patch(`/api/users/${id}/`, {
      ...userData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
},
  
// Supprimer un utilisateur
async deleteUser(userId: string): Promise<void> {
  try {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("❌ Token manquant !");
    }

    const response = await fetch(`http://13.38.119.12/api/users/${userId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de l'utilisateur");
    }
  } catch (error: any) {
    console.error("❌ Erreur lors de la suppression de l'utilisateur:", error);
    throw error;
  }
},


  // Récupérer la liste de tous les groupes
  async getAllGroups(): Promise<Group[]> {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error("❌ Token manquant !");
      }

      const response = await fetch(`http://13.38.119.12/api/groups/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des groupes");
      }

      return response.json();
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération des groupes:", error);
      throw error;
    }
  },

// Mettre à jour les groupes d'un utilisateur
async updateUserGroups({ userId, groupIds }: { userId: string; groupIds: string[] }): Promise<void> {
  try {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("❌ Token manquant !");
    }

    if (!groupIds.length) {
      throw new Error("❌ Aucun groupe sélectionné !");
    }

    const response = await fetch(`http://13.38.119.12/api/users/${userId}/assign_group/`, {
      method: 'POST', // Change en 'PATCH' ou 'PUT' si nécessaire
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ group_ids: groupIds }), // Change en { groups: groupIds } si nécessaire
    });

    const responseData = await response.json(); // Récupérer la réponse du backend

    if (!response.ok) {
      console.error("❌ Erreur API:", responseData);
      throw new Error(`Erreur API: ${responseData.detail || "Mise à jour échouée"}`);
    }

    console.log("✅ Groupes mis à jour avec succès :", responseData);
  } catch (error: any) {
    console.error("❌ Erreur lors de la mise à jour des groupes:", error.message);
    throw error;
  }
},

 // Gestion des groupes
 async getGroupById(groupId: string): Promise<Group> {
  try {
    const response = await api.get(`/api/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du groupe:', error);
    throw error;
  }
},

// Création d'un groupe
async createGroup(name: string): Promise<Group> {
  try {
    const response = await api.post(`/api/groups/`, { name });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du groupe:', error);
    throw error;
  }
},

// Mise à jour d'un groupe
async updateGroup(groupId: string, name: string): Promise<Group> {
  try {
    const response = await api.put(`/api/groups/${groupId}/`, { name });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du groupe ${groupId}:`, error);
    throw error;
  }
},



async updateGroupPermissions(groupId: string, permissionIds: string[]): Promise<Group> {
  try {
    const response = await api.post(`/api/group/${groupId}/update_permissions/`, {
      permission_ids: permissionIds
    });

    console.log('Réponse complète API mise à jour permissions:', response);

    return response.data; // Vérifier si `data` est bien défini
  } catch (error: any) {
    console.error('Erreur API:', error.response?.data || error.message);
    throw error;
  }
},

async resetPassword(uid: string | null, token: string | null, password: string): Promise<void> {
  try {
    // Vérifier si l'uid et le token sont présents
    if (!uid || !token) {
      throw new Error('UID ou Token manquant');
    }

    // Construire l'URL avec l'uid et le token
    const url = `/api/reset-password/${uid}/${token}/`;

    // Envoyer la requête POST avec le nouveau mot de passe
    await api.post(url, { new_password: password, confirm_password: password });
  } catch (error) {
    throw new Error('Une erreur est survenue lors de la réinitialisation du mot de passe');
  }
},








};
