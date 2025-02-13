import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Lock } from 'lucide-react'; 
import { groupManagement } from '../components/GroupManagement'; 
import { api } from '../lib/api'; 
import CreateGroupModal from '../components/CreateGroupModal';
import EditGroupModal from '../components/EditGroupModal';

// Définir le type ou l'interface pour Group
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
  const [permissions, setPermissions] = useState<Permission[]>([]); // Stocker la liste des permissions
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]); // Permissions sélectionnées
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  

  useEffect(() => {
    // Charger les groupes existants
    const fetchGroups = async () => {
      try {
        const data = await groupManagement.getAllGroups();
        setGroups(data);
      } catch (error) {
        console.error('Erreur lors du chargement des groupes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPermissions = async () => {
      try {
        // Supposons que vous récupérez le token depuis localStorage ou un autre endroit
        const token = localStorage.getItem('auth_token'); // Remplacez par la méthode qui récupère le token
        
        if (!token) {
          throw new Error('Token d\'authentification non trouvé');
        }
    
        // Effectuer la requête pour récupérer les permissions en incluant le token dans les en-têtes
        const response = await fetch('http://13.38.119.12/api/permissions/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // En-tête d'authentification
            'Content-Type': 'application/json',
          },
        });
    
        // Vérifier si la réponse est réussie
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
    
        // Récupérer et traiter les données JSON
        const data = await response.json();
        console.log('Réponse complète de l\'API:', data);  // Affiche la réponse complète dans la console
        
        // Vérifier si les données des permissions sont présentes
        if (data && data.permissions_data) {
          setPermissions(data.permissions_data); // Mettre à jour les permissions dans l'état
        } else {
          console.error('Données des permissions non trouvées dans la réponse');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des permissions:', error);
      }
    };
    
    

    fetchGroups();
    fetchPermissions();
  }, []);

  const handleCreateGroup = async (name: string) => {
    try {
      await groupManagement.createGroup(name);
      const data = await groupManagement.getAllGroups();
      setGroups(data); // Recharger les groupes après création
      setIsCreateGroupModalOpen(false); // Fermer le modal après création
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
    }
  };

  const handleEditGroup = (groupId: string, currentName: string) => {
    setCurrentGroupId(groupId);
    setNewGroupName(currentName); // Préremplir le champ avec le nom actuel
    setIsEditGroupModalOpen(true); // Ouvrir le modal pour modification
  };
  
  
  const handleSaveEditedGroup = async (name: string) => {
    if (currentGroupId) {
      try {
        // Appel à la fonction updateGroup
        await groupManagement.updateGroup(currentGroupId, name);
        
        // Recharger les groupes après modification
        const data = await groupManagement.getAllGroups();
        setGroups(data);
        setIsEditGroupModalOpen(false); // Fermer le modal après modification
        setCurrentGroupId(null); // Réinitialiser l'ID du groupe
        setNewGroupName(''); // Réinitialiser le nom du groupe
      } catch (error) {
        console.error('Erreur lors de la mise à jour du groupe:', error);
      }
    }
  };
  
  

  const handleDeleteGroup = async (groupId: string) => {
    if (isDeleting === groupId) {
      try {
        await groupManagement.deleteGroup(groupId);
        const data = await groupManagement.getAllGroups();
        setGroups(data); // Recharger les groupes après suppression
        setIsDeleting(null); // Réinitialiser l'état de suppression
      } catch (error) {
        console.error('Erreur lors de la suppression du groupe:', error);
      }
    } else {
      setIsDeleting(groupId); // Activer la confirmation de suppression
    }
  };

  const handlePermissionsClick = (groupId: string) => {
    setCurrentGroupId(groupId);
    setIsPermissionsModalOpen(true); // Ouvrir le modal pour gérer les permissions
  };

  const handlePermissionToggle = (permissionIds: number) => {
    console.log("permission recupére", permissionIds)
    setSelectedPermissions((prevSelected) =>
      prevSelected.includes(permissionIds)
        ? prevSelected.filter((id) => id !== permissionIds)
        : [...prevSelected, permissionIds]
    );
  };

  const handleSavePermissions = async () => {
    if (currentGroupId && selectedPermissions.length > 0) {
      console.log('Permissions envoyées:', selectedPermissions); // Vérifier les permissions envoyées
      try {
        await groupManagement.updateGroupPermissions(currentGroupId, selectedPermissions);
        setIsPermissionsModalOpen(false);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des permissions:', error);
      }
    }
  };
  

  return (
    <div className="mb-8">
      {/* Partie supérieure */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gestion des Groupes</h1>
          <p className="text-gray-600">Gérez les groupes et leurs paramètres</p>
        </div>
        <button
          onClick={() => setIsCreateGroupModalOpen(true)} // Ouvrir le modal pour créer un groupe
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Créer un groupe
        </button>
      </div>

      {/* Liste des groupes */}
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
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <span className="text-blue-600">{group.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                  <button
                    onClick={() => handleEditGroup(group.id, group.name)} // Ouvrir le modal pour modifier
                    className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>


                    <button
                      onClick={() => handleDeleteGroup(group.id)} 
                      className={`text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 ${isDeleting === group.id ? 'bg-red-600 text-white' : ''}`}
                    >
                      <Trash className="w-4 h-4" />
                      {isDeleting === group.id ? 'Confirmer' : 'Supprimer'}
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

        {/* Modal pour éditer un groupe */}
        <EditGroupModal
                isOpen={isEditGroupModalOpen}
                onClose={() => setIsEditGroupModalOpen(false)}
                onSubmit={handleSaveEditedGroup}
                currentName={newGroupName}
                
              />




      {/* Modal pour gérer les permissions */}
     {/* Modal pour gérer les permissions */}
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
    


    </div>
  );
}

export default GroupManagement;
