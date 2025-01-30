import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Activite, SousActivite } from '../types';

interface EditSubActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activite;
  subActivity: SousActivite;
  onSubmit: (updatedSubActivity: SousActivite) => void;
}

const EditSubActivityModal: React.FC<EditSubActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  subActivity,
  onSubmit
}) => {
  const [editedSubActivity, setEditedSubActivity] = useState<SousActivite>({...subActivity});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(editedSubActivity);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Modifier la sous-activité</h2>
            <p className="text-gray-600 mt-1">Pour l'activité : {activity.nom}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la sous-activité
            </label>
            <input
              type="text"
              value={editedSubActivity.nom}
              onChange={(e) => setEditedSubActivity({ ...editedSubActivity, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editedSubActivity.description}
              onChange={(e) => setEditedSubActivity({ ...editedSubActivity, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant prévu (€)
              </label>
              <input
                type="number"
                value={editedSubActivity.montantPrevu}
                onChange={(e) => setEditedSubActivity({
                  ...editedSubActivity,
                  montantPrevu: parseFloat(e.target.value)
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={editedSubActivity.statut}
                onChange={(e) => setEditedSubActivity({
                  ...editedSubActivity,
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
                value={editedSubActivity.dateDebut?.toISOString().split('T')[0]}
                onChange={(e) => setEditedSubActivity({
                  ...editedSubActivity,
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
                value={editedSubActivity.dateFin?.toISOString().split('T')[0]}
                onChange={(e) => setEditedSubActivity({
                  ...editedSubActivity,
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

export default EditSubActivityModal;