import React, { useState, useEffect } from 'react';
import { X, Shield, Save, XCircle } from 'lucide-react';
import { authService } from '../services/authService';
import type { Group, Permission } from '../types/auth';

interface UserGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  initialGroups: string[];
  onSubmit: (groupIds: string[]) => void;
}

const UserGroupsModal: React.FC<UserGroupsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  initialGroups,
  onSubmit
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initialGroups);
  const [groupPermissions, setGroupPermissions] = useState<Record<string, Permission[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadGroups();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedGroups(initialGroups);
    fetchPermissionsForSelectedGroups(initialGroups);
  }, [initialGroups]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const fetchedGroups = await authService.getAllGroups();
      setGroups(fetchedGroups);
      setError(null);
    } catch (err: any) {
      console.error('❌ Erreur lors de la récupération des groupes:', err.message);
      setError('Erreur lors de la récupération des groupes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissionsForSelectedGroups = async (groupIds: string[]) => {
    const permissionsMap: Record<string, Permission[]> = {};
    for (const groupId of groupIds) {
      try {
        const groupDetail = await authService.getGroupById(groupId);
        permissionsMap[groupId] = groupDetail.permissions;
      } catch (err) {
        console.error(`Erreur lors de la récupération des permissions du groupe ${groupId}`);
      }
    }
    setGroupPermissions(permissionsMap);
  };

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups((prev) => {
      const newSelection = prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId];
      fetchPermissionsForSelectedGroups(newSelection);
      return newSelection;
    });
  };

  const handleSubmit = async () => {
    try {
      await authService.assignUserGroups({ userId, groupId: selectedGroups });
      onSubmit(selectedGroups);
      onClose();
    } catch (err: any) {
      console.error('❌ Erreur lors de la mise à jour des groupes:', err.message);
      setError('Erreur lors de la mise à jour des groupes');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm">
      <div className="fixed inset-0 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gérer les groupes</h2>
                <p className="text-sm text-gray-600 mt-1">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {groups.map((group) => (
                    <label key={group.id} className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={() => handleToggleGroup(group.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900">{group.name}</span>
                        <ul className="text-sm text-gray-600 mt-1">
                          {(groupPermissions[group.id] || []).map((perm) => (
                            <li key={perm.id}>- {perm.name}</li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Annuler</button>
                  <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGroupsModal;