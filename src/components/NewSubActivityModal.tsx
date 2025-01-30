import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Activite, SousActivite } from '../types';

interface NewSubActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activite;
  onSubmit: (newSubActivity: SousActivite) => void;
}

const NewSubActivityModal: React.FC<NewSubActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSubmit
}) => {
  const [newSousActivite, setNewSousActivite] = useState<Omit<SousActivite, 'id'>>({
    nom: '',
    description: '',
    montantPrevu: 0,
    intervenant: { id: '', nom: '', role: '', sousActivites: [] },
    statut: 'En attente'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...newSousActivite,
      id: crypto.randomUUID()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Nouvelle sous-activité</h2>
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
              value={newSousActivite.nom}
              onChange={(e) => setNewSousActivite({ ...newSousActivite, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newSousActivite.description}
              onChange={(e) => setNewSousActivite({ ...newSousActivite, description: e.target.value })}
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
                value={newSousActivite.montantPrevu}
                onChange={(e) => setNewSousActivite({
                  ...newSousActivite,
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
                value={newSousActivite.statut}
                onChange={(e) => setNewSousActivite({
                  ...newSousActivite,
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
                onChange={(e) => setNewSousActivite({
                  ...newSousActivite,
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
                onChange={(e) => setNewSousActivite({
                  ...newSousActivite,
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
              Ajouter la sous-activité
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSubActivityModal;