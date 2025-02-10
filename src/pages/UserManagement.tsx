import React, { useState, useEffect } from 'react';
import { Plus, UserCog, Shield, Users as UsersIcon } from 'lucide-react';
import { authService } from '../services/authService';
import type { User, Group } from '../types'; // Assurez-vous d'importer Group
import UserGroupsModal from '../components/UserGroupsModal';
import InviteUserModal from '../components/InviteUserModal';

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserGroupsModalOpen, setIsUserGroupsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await authService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []); // ✅ S'assurer que `setUsers` reçoit un tableau
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]); // ✅ Évite les erreurs si la requête échoue
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (email: string, groupIds: string[]) => {
    try {
      // Passer un objet avec `email` et `groupIds`
      await authService.createUser({ email, groupIds });
      await loadUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      alert("Erreur lors de l'invitation de l'utilisateur");
    }
  };
  const handleUpdateUserGroups = async (userId: string, groupIds: string[]) => {
    try {
      // Passez un objet avec `userId` et `groupIds`
      await authService.updateUserGroups({ userId, groupIds });
      loadUsers(); // Recharge les utilisateurs après la mise à jour
    } catch (error) {
      console.error('Erreur lors de la mise à jour des groupes de l\'utilisateur:', error);
      alert("Erreur lors de la mise à jour des groupes");
    }
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
                      <div className="flex items-center gap-2 mt-1">
                        <UsersIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {user.groups && user.groups.length > 0
                            ? user.groups.map((g) => g.name).join(', ')
                            : 'Aucun groupe'}
                        </span>
                      </div>
                    </div>
                  </div>
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
          userId={selectedUser.id}  // Utilisation de `selectedUser.id`
          userEmail={selectedUser.email}
          initialGroups={selectedUser.groups ? selectedUser.groups.map((g) => g.id) : []}
          onSubmit={(groupIds) => handleUpdateUserGroups(selectedUser.id, groupIds)}  // Utilisation de `groupIds` en tant que chaînes
        />
      )}
    </>
  );
}

export default UserManagement;
