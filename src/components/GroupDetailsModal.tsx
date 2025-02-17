import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Trash2, Users, Calendar } from 'lucide-react';
import { groupManagement } from '../services/GroupManagement';
import type { Group, Permission } from '../types/auth';
import toast from 'react-hot-toast';
import DeleteGroupConfirmationModal from './DeleteGroupConfirmationModal';

interface GroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onDelete: (groupId: string) => void;
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  isOpen,
  onClose,
  groupId,
  onDelete
}) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && groupId) {
      loadGroupDetails();
    }
  }, [isOpen, groupId]);

  const loadGroupDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const groupDetails = await groupManagement.getGroupById(groupId);
      setGroup(groupDetails);
    } catch (err: any) {
      console.error('❌ Erreur lors de la récupération des détails du groupe:', err.message);
      setError('Erreur lors de la récupération des détails du groupe');
      toast.error('Erreur lors de la récupération des détails du groupe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(groupId);
      setIsDeleteModalOpen(false);
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la suppression du groupe");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm">
        <div className="fixed inset-0 transition-opacity" onClick={onClose} />
        
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            {/* En-tête avec effet de gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Détails du groupe</h2>
                    {group && (
                      <p className="text-blue-100 mt-1">{group.name}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              ) : group ? (
                <div className="space-y-8">
                  {/* Statistiques du groupe */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-blue-600">Permissions</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{group.permissions.length}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-500/10 p-2 rounded-lg">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-purple-600">Date de création</span>
                      </div>
                      <p className="text-sm font-medium text-purple-900">
                        {new Date().toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Liste des permissions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Permissions attribuées
                    </h3>
                    {group.permissions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                          >
                            <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                              <Lock className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {permission.name}
                              </span>
                              {permission.codename && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {permission.codename}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">
                          Aucune permission attribuée à ce groupe
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Groupe non trouvé
                </div>
              )}
            </div>

            <div className="border-t p-6 flex justify-between">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer le groupe
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      {group && (
        <DeleteGroupConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          groupName={group.name}
          isLoading={isDeleting}
        />
      )}
    </>
  );
};

export default GroupDetailsModal;