import { api } from '../lib/api'; 
import type { User, AuthTokens, LoginRequest, Group, Permission,  ResetPasswordResponse } from '../types/auth';
import { jwtDecode } from 'jwt-decode';  


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
/*   async getCurrentUser(): Promise<User | null> {
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
  }, */

  async getCurrentUser(): Promise<User | null> {
    try {
      let token = this.getToken();
      if (!token) {
        return null;
      }

      // Si le token est expiré, essayer de le rafraîchir
      if (this.isTokenExpired(token)) {
        const newTokens = await this.refreshAccessToken();
        if (!newTokens) {
          this.removeTokens();
          return null;
        }
        token = newTokens.access;
      }

      // Décoder le token pour obtenir l'ID de l'utilisateur
      const decoded: any = jwtDecode(token);
      const userId = decoded.user_id;

      if (!userId) {
        this.removeTokens();
        return null;
      }

      const response = await fetch(`http://13.38.119.12/api/users/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Si le token est invalide, essayer de le rafraîchir une dernière fois
        if (response.status === 403) {
          const newTokens = await this.refreshAccessToken();
          if (!newTokens) {
            this.removeTokens();
            return null;
          }
          
          // Réessayer avec le nouveau token
          const retryResponse = await fetch(`http://13.38.119.12/api/users/${userId}/`, {
            headers: {
              'Authorization': `Bearer ${newTokens.access}`,
              'Content-Type': 'application/json'
            }
          });

          if (!retryResponse.ok) {
            this.removeTokens();
            return null;
          }

          const data = await retryResponse.json();
          return {
            id: data.id,
            username: data.username || '',
            email: data.email || '',
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            password: '',
            groups: data.groups || []
          };
        }

        throw new Error('Erreur lors de la récupération des données utilisateur');
      }

      const data = await response.json();
      return {
        id: data.id,
        username: data.username || '',
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        password: '',
        groups: data.groups || []
      };
    } catch (error) {
      console.error('Erreur de récupération de l\'utilisateur:', error);
      this.removeTokens();
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
async assignUserGroups({ userId, groupId }: { userId: string; groupId: string[] }): Promise<void> {
  try {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    if (!groupId || groupId.length === 0) { // Vérification améliorée
      throw new Error("Aucun groupe sélectionné !");
    }

    // Récupérer les détails du groupe pour avoir son nom
    const group = await this.getGroupById(groupId[0]);

    console.log("📝 Données envoyées:", {
      userId,
      group: group?.name,
      url: `http://13.38.119.12/api/users/${userId}/assign_group/`
    });

    const response = await fetch(`http://13.38.119.12/api/users/${userId}/assign_group/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ group: group?.name }), // Vérification sécurisée avec "?"
    });

    // Log de la réponse brute pour le débogage
    console.log("📡 Réponse brute:", response);

    const responseData = await response.json();
    console.log("📡 Réponse détaillée:", responseData);

    if (!response.ok) {
      console.error("❌ Erreur détaillée:", responseData);
      throw new Error(responseData.error || "Mise à jour échouée");
    }

    console.log("✅ Groupes mis à jour avec succès:", responseData);
  } catch (error: any) {
    console.error("❌ Erreur lors de la mise à jour des groupes:", error);
    throw new Error(error.message || "Erreur lors de la mise à jour des groupes");
  }
},

// Récupérer un groupe par son ID
async getGroupById(groupId: string): Promise<Group> {
  try {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    // Convert groupId to number si nécessaire
    const numericGroupId = parseInt(groupId, 10);
    
    if (isNaN(numericGroupId)) {
      throw new Error("ID de groupe invalide");
    }

    console.log(`🔍 Récupération du groupe ${numericGroupId}`);

    const response = await fetch(`http://13.38.119.12/api/groups/${numericGroupId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      console.error(`❌ Erreur HTTP ${response.status}:`, data);
      throw new Error(data.error || `Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📡 Réponse pour le groupe ${numericGroupId}:`, data);
    
    // Vérification de la structure des données retournées
    if (!data.id || !data.name) {
      throw new Error("Données du groupe invalides !");
    }

    const group: Group = {
      id: data.id,
      name: data.name,
      permissions: Array.isArray(data.permissions) ? data.permissions : []
    };

    return group;
  } catch (error: any) {
    console.error(`❌ Erreur lors de la récupération du groupe ${groupId}:`, error);
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

// Récupérer les permissions d'un groupe
async getGroupPermissions(groupId: string): Promise<Permissions[]> {
  try {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Token manquant !");
    }

    const response = await fetch(`http://13.38.119.12/api/groups/${groupId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ Erreur API:", responseData);
      throw new Error(`Erreur API: ${responseData.detail || "Récupération des permissions échouée"}`);
    }

    console.log("✅ Permissions récupérées avec succès :", responseData.permissions);
    return responseData.permissions;
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des permissions:", error.message);
    throw error;
  }
},

async updateGroupPermissions(groupId: string, permissions: number[]): Promise<Group> {
  try {
    const response = await api.post(`/api/group/${groupId}/update_permissions/`, {
      permissions: permissions
    });

    console.log('Réponse complète API mise à jour permissions:', response);

    return response.data; // Vérifier si `data` est bien défini
  } catch (error: any) {
    console.error('Erreur API:', error.response?.data || error.message);
    throw error;
  }
},

async resetPassword(uid: string, token: string, newPassword: string): Promise<ResetPasswordResponse> {
  try {
    const response = await fetch(`http://13.38.119.12/api/reset-password/${uid}/${token}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_password: newPassword,
        confirm_password: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la réinitialisation du mot de passe');
    }

    const data = await response.json();
    return data as ResetPasswordResponse;
  } catch (error: any) {
    console.error('Erreur de réinitialisation du mot de passe:', error);
    throw new Error(error.message || 'Erreur lors de la réinitialisation du mot de passe');
  }
},

async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  const token = this.getToken();
  if (!token) throw new Error('Non authentifié');

  try {
    await api.post(`/api/users/${userId}/change-password/`, {
      old_password: oldPassword,
      new_password: newPassword
    });
  } catch (error: any) {
    console.error('Erreur de changement de mot de passe:', error);
    throw new Error(error.response?.data?.message || 'Erreur de changement de mot de passe');
  }
},

  // Mot de pass oublié
async requestPasswordReset(email: string): Promise<void> {
  try {
    const response = await fetch('http://13.38.119.12/api/forgot-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la demande de réinitialisation');
    }
  } catch (error: any) {
    console.error('Erreur de demande de réinitialisation:', error);
    throw new Error(error.message || 'Erreur lors de la demande de réinitialisation');
  }
},







};
