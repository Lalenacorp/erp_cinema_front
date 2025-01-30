import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Activite } from '../types';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activite;
  onSubmit: (updatedActivity: Activite) => void;
}

const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSubmit
}) => {
  const [editedActivity, setEditedActivity] = useState<Activite>({...activity});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(editedActivity);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Modifier l'activité</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'activité
            </label>
            <input
              type="text"
              value={editedActivity.nom}
              onChange={(e) => setEditedActivity({ ...editedActivity, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editedActivity.description}
              onChange={(e) => setEditedActivity({ ...editedActivity, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={editedActivity.statut}
                onChange={(e) => setEditedActivity({
                  ...editedActivity,
                  statut: e.target.value as 'En cours' | 'Terminée' | 'En attente'
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="En attente">En attente</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={editedActivity.dateDebut?.toISOString().split('T')[0]}
                onChange={(e) => setEditedActivity({
                  ...editedActivity,
                  dateDebut: new Date(e.target.value)
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin prévue
              </label>
              <input
                type="date"
                value={editedActivity.dateFin?.toISOString().split('T')[0]}
                onChange={(e) => setEditedActivity({
                  ...editedActivity,
                  dateFin: new Date(e.target.value)
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditActivityModal;