import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Lock, Eye } from 'lucide-react'; 
import { groupManagement } from '../services/GroupManagement'; 
import CreateGroupModal from '../components/CreateGroupModal';
import EditGroupModal from '../components/EditGroupModal';
import GroupDetailsModal from '../components/GroupDetailsModal';
import toast from 'react-hot-toast';

interface Group {
  id: string;
  name: string;
}

interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: string;
}

function GroupManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]); 
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isGroupDetailsModalOpen, setIsGroupDetailsModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await groupManagement.getAllGroups();
        setGroups(data);
      } catch (error) {
        console.error('Erreur lors du chargement des groupes:', error);
        toast.error('Erreur lors du chargement des groupes');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          throw new Error('Token d\'authentification non trouvé');
        }
    
        const response = await fetch('http://13.38.119.12/api/permissions/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
    
        const data = await response.json();
        console.log('Réponse complète de l\'API:', data);
        
        if (data && data.permissions_data) {
          setPermissions(data.permissions_data);
        } else {
          console.error('Données des permissions non trouvées dans la réponse');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des permissions:', error);
        toast.error('Erreur lors du chargement des permissions');
      }
    };

    fetchGroups();
    fetchPermissions();
  }, []);

  const handleCreateGroup = async (name: string) => {
    try {
      await groupManagement.createGroup(name);
      const data = await groupManagement.getAllGroups();
      setGroups(data);
      setIsCreateGroupModalOpen(false);
      toast.success('Groupe créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
      toast.error('Erreur lors de la création du groupe');
    }
  };

  const handleEditGroup = (groupId: string, currentName: string) => {
    setCurrentGroupId(groupId);
    setNewGroupName(currentName);
    setIsEditGroupModalOpen(true);
  };
  
  const handleSaveEditedGroup = async (name: string) => {
    if (currentGroupId) {
      try {
        await groupManagement.updateGroup(currentGroupId, name);
        const data = await groupManagement.getAllGroups();
        setGroups(data);
        setIsEditGroupModalOpen(false);
        setCurrentGroupId(null);
        setNewGroupName('');
        toast.success('Groupe mis à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du groupe:', error);
        toast.error('Erreur lors de la mise à jour du groupe');
      }
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await groupManagement.deleteGroup(groupId);
      const data = await groupManagement.getAllGroups();
      setGroups(data);
      toast.success('Groupe supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe:', error);
      toast.error('Erreur lors de la suppression du groupe');
    }
  };

  const handlePermissionsClick = (groupId: string) => {
    setCurrentGroupId(groupId);
    setIsPermissionsModalOpen(true);
  };

  const handlePermissionToggle = (permissionIds: number) => {
    setSelectedPermissions((prevSelected) =>
      prevSelected.includes(permissionIds)
        ? prevSelected.filter((id) => id !== permissionIds)
        : [...prevSelected, permissionIds]
    );
  };

  const handleSavePermissions = async () => {
    if (currentGroupId && selectedPermissions.length > 0) {
      try {
        await groupManagement.updateGroupPermissions(currentGroupId, selectedPermissions);
        setIsPermissionsModalOpen(false);
        toast.success('Permissions mises à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des permissions:', error);
        toast.error('Erreur lors de la mise à jour des permissions');
      }
    }
  };

  const handleViewDetails = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsGroupDetailsModalOpen(true);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gestion des Groupes</h1>
          <p className="text-gray-600">Gérez les groupes et leurs paramètres</p>
        </div>
        <button
          onClick={() => setIsCreateGroupModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Créer un groupe
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Liste des groupes</h2>
          <p className="text-gray-600 mt-1">
            {groups.length > 0 ? `${groups.length} groupe${groups.length > 1 ? 's' : ''}` : "Aucun groupe"}
          </p>
        </div>

        <div className="divide-y">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Chargement des groupes...</div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className=" p-2 rounded-lg">
                      <span className="text-blue-600">{group.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(group.id)}
                      className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Voir détails
                    </button>
                    <button
                      onClick={() => handleEditGroup(group.id, group.name)}
                      className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handlePermissionsClick(group.id)} 
                      className="text-yellow-600 hover:bg-yellow-50 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Permissions
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">Aucun groupe trouvé</div>
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onSubmit={handleCreateGroup}
      />

      <EditGroupModal
        isOpen={isEditGroupModalOpen}
        onClose={() => setIsEditGroupModalOpen(false)}
        onSubmit={handleSaveEditedGroup}
        currentName={newGroupName}
      />

      {isPermissionsModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Gérer les Permissions du Groupe</h2>
            <div className="grid grid-cols-2 gap-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    className="form-checkbox"
                  />
                  <label htmlFor={`permission-${permission.id}`} className="text-gray-700">
                    {permission.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePermissions}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedGroupId && (
        <GroupDetailsModal
          isOpen={isGroupDetailsModalOpen}
          onClose={() => {
            setIsGroupDetailsModalOpen(false);
            setSelectedGroupId(null);
          }}
          groupId={selectedGroupId}
          onDelete={handleDeleteGroup}
        />
      )}
    </div>
  );
}

export default GroupManagement;