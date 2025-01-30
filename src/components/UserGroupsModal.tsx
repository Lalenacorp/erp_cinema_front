import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Group } from '../types';
import { authService } from '../services/authService';

interface UserGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  initialGroups?: string[];
  onSubmit: (groupIds: string[]) => Promise<void>;
}

const UserGroupsModal: React.FC<UserGroupsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  initialGroups = [],
  onSubmit
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initialGroups);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await authService.getAllGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedGroups);
      onClose();
    } catch (error) {
      console.error('Error updating user groups:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Groupes d'utilisateur</h2>
            <p className="text-gray-600 mt-1">
              Gérer les groupes pour {userEmail}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {groups.map((group) => (
              <label
                key={group.id}
                className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGroups([...selectedGroups, group.id]);
                    } else {
                      setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                    }
                  }}
                  className="mt-1"
                />
                <div className="ml-3">
                  <p className="font-medium">{group.name}</p>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserGroupsModal;