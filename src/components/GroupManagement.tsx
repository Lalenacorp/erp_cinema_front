import { authService } from '../services/authService'; 

export const groupManagement = {
  // Créer un groupe
  async createGroup(name: string) {
    try {
      const response = await authService.createGroup(name);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
      throw error;
    }
  },

  // Obtenir tous les groupes
  async getAllGroups() {
    try {
      const response = await authService.getAllGroups();
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes:', error);
      throw error;
    }
  },

  // Obtenir un groupe par ID
  async getGroupById(groupId: string) {
    try {
      const response = await authService.getGroupById(groupId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du groupe:', error);
      throw error;
    }
  },

  // Mettre à jour un groupe
  async updateGroup(groupId: string, name: string) {
    try {
      const response = await authService.updateGroup(groupId, name);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du groupe:', error);
      throw error;
    }
  },

 /*  // Mettre à jour les groupes d'un utilisateur
  async assigneUserGroups({ userId, groupIds }: { userId: string; groupIds: string[] }) {
    try {
      await authService.assignUserGroups({ userId, groupIds });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des groupes de l\'utilisateur:', error);
      throw error;
    }
  },
 */
  // Mettre à jour les permissions d'un groupe
  async updateGroupPermissions(groupId: string, permissions: number[]) {
    try {
      const response = await authService.updateGroupPermissions(groupId, permissions);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions du groupe:', error);
      throw error;
    }
  },

  // Supprimer un groupe
  async deleteGroup(groupId: string) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token de l\'utilisateur introuvable');
      }

      const response = await fetch(`http://13.38.119.12/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,  // Assurez-vous que le token est envoyé
          'Content-Type': 'application/json',
        },
      });

      // Vérifier si la réponse est vide ou non
      if (response.status === 204) {
        console.log('Groupe supprimé avec succès.');
        return;
      }

      // Si la réponse contient des données JSON, les traiter
      if (!response.ok) {
        throw new Error('Échec de la suppression du groupe');
      }

      const data = await response.json();
      console.log('Réponse du serveur:', data);
      return data;

    } catch (error) {
      console.error('Erreur lors de la suppression du groupe:', error);
      throw error;
    }
  }
};
