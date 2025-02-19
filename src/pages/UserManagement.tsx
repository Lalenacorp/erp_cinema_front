import React, { useState, useEffect } from 'react';
import { Plus, UserCog, Shield, Users as UsersIcon, Eye } from 'lucide-react';
import { authService } from '../services/authService';
import type { User, Group } from '../types/auth';
import UserGroupsModal from '../components/UserGroupsModal';
import InviteUserModal from '../components/InviteUserModal';
import UserDetails from '../components/UserDetails';
import toast from 'react-hot-toast';

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserGroupsModalOpen, setIsUserGroupsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    try {
      const data = await authService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setUsers([]);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (
    email: string,
    firstName: string,
    lastName: string,
    username: string,
    password: string
  ) => {
    try {
      await authService.createUser({
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
      });
      toast.success(`Invitation envoyée avec succès à ${email}`);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de l\'invitation de l\'utilisateur:', error);
      toast.error('Échec de l\'invitation. Vérifiez les informations.');
    }
  };

  const handleUpdateUserGroups = async (userId: string, groupId: string[]) => {
    try {
      await authService.assignUserGroups({ userId, groupId });
      await loadUsers();
      toast.success('Groupes mis à jour avec succès');
      setIsUserGroupsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des groupes de l\'utilisateur:', error);
      toast.error("Erreur lors de la mise à jour des groupes");
    }
  };

  const handleViewUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserDetailsModalOpen(true);
  };

  const handleUserDeleted = () => {
    loadUsers();
    setIsUserDetailsModalOpen(false);
    toast.success('Utilisateur supprimé avec succès');
  };

  const handleUserUpdated = () => {
    loadUsers();
    toast.success('Utilisateur mis à jour avec succès');
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestion des utilisateurs</h1>
            <p className="text-gray-600">Gérez les utilisateurs et leurs permissions</p>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Inviter un utilisateur
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Liste des utilisateurs</h2>
          <p className="text-gray-600 mt-1">
            {users.length > 0 ? `${users.length} utilisateur${users.length > 1 ? 's' : ''}` : "Aucun utilisateur"}
          </p>
        </div>

        <div className="divide-y">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Chargement des utilisateurs...</div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <UserCog className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{user.email}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewUserDetails(user.id)}
                      className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Voir détails
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsUserGroupsModalOpen(true);
                      }}
                      className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Gérer les groupes
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">Aucun utilisateur trouvé</div>
          )}
        </div>
      </div>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteUser}
      />

      {selectedUser && (
        <UserGroupsModal
          isOpen={isUserGroupsModalOpen}
          onClose={() => {
            setIsUserGroupsModalOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          initialGroups={selectedUser.groups ? selectedUser.groups.map((g) => g.id) : []}
          onSubmit={(groupIds) => handleUpdateUserGroups(selectedUser.id, groupIds)}
        />
      )}

      <UserDetails
        isOpen={isUserDetailsModalOpen}
        onClose={() => setIsUserDetailsModalOpen(false)}
        userId={selectedUserId}
        onUserDeleted={handleUserDeleted}
        onUserUpdated={handleUserUpdated}
      />
    </>
  );
}

export default UserManagement;