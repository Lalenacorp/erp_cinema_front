import React, { useState, useEffect } from 'react';
import { X, Mail, Shield } from 'lucide-react';
import type { Group } from '../types';
import { authService } from '../services/authService';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, groupIds: string[]) => Promise<void>;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [email, setEmail] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) loadGroups();
  }, [isOpen]);

  const loadGroups = async () => {
    try {
      const data = await authService.getAllGroups();
      setGroups(data);
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(email, selectedGroups);
      alert(`Invitation envoyée avec succès à ${email}`);
      setEmail('');
      setSelectedGroups([]);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'invitation de l\'utilisateur:', error);
      alert('Échec de l\'invitation. Vérifiez les informations.');
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
            <h2 className="text-2xl font-bold">Inviter un utilisateur</h2>
            <p className="text-gray-600 mt-1">
              Envoyez une invitation par email et assignez des groupes.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="exemple@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Groupes
            </label>
            <div className="space-y-3">
              {/* Vérifier si `groups` est défini et est un tableau avant d'utiliser map */}
              {Array.isArray(groups) && groups.length > 0 ? (
                groups.map((group) => (
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
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <p className="font-medium">{group.name}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{group.permissions}</p>
                    </div>
                  </label>
                ))
              ) : (
                <p>Aucun groupe disponible</p>
              )}
            </div>
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
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
