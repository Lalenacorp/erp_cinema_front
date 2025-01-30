import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Activite, SousActivite, Intervenant, Project } from '../types';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activite: Activite) => void;
  intervenants: Intervenant[];
  projects: Project[];
  selectedProjectId?: string;
}

const NewActivityModal: React.FC<NewActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  selectedProjectId
}) => {
  const [activite, setActivite] = useState<Omit<Activite, 'id'>>({
    projetId: selectedProjectId || '',
    nom: '',
    description: '',
    montantTotal: 0,
    sousActivites: [],
    statut: 'En attente'
  });

  // Mettre à jour le projetId quand selectedProjectId change
  useEffect(() => {
    if (selectedProjectId) {
      setActivite(prev => ({ ...prev, projetId: selectedProjectId }));
    }
  }, [selectedProjectId]);

  const [newSousActivite, setNewSousActivite] = useState<Omit<SousActivite, 'id'>>({
    nom: '',
    description: '',
    montantPrevu: 0,
    statut: 'En attente'
  });

  const handleAddSousActivite = () => {
    if (newSousActivite.nom && newSousActivite.montantPrevu > 0) {
      const sousActiviteWithId: SousActivite = {
        ...newSousActivite,
        id: crypto.randomUUID()
      };
      
      setActivite({
        ...activite,
        sousActivites: [...activite.sousActivites, sousActiviteWithId],
        montantTotal: activite.montantTotal + newSousActivite.montantPrevu
      });
      
      setNewSousActivite({
        nom: '',
        description: '',
        montantPrevu: 0,
        statut: 'En attente'
      });
    }
  };

  const handleRemoveSousActivite = (index: number) => {
    const newSousActivites = activite.sousActivites.filter((_, i) => i !== index);
    const newMontantTotal = newSousActivites.reduce((sum, sa) => sum + sa.montantPrevu, 0);
    setActivite({
      ...activite,
      sousActivites: newSousActivites,
      montantTotal: newMontantTotal
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activite.nom && activite.projetId && activite.sousActivites.length > 0) {
      onSubmit(activite as Activite);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nouvelle Activité</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du projet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projet
            </label>
            <select
              value={activite.projetId}
              onChange={(e) => setActivite({ ...activite, projetId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!selectedProjectId}
            >
              <option value="">Sélectionnez un projet</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Informations principales de l'activité */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'activité
              </label>
              <input
                type="text"
                value={activite.nom}
                onChange={(e) => setActivite({ ...activite, nom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={activite.description}
                onChange={(e) => setActivite({ ...activite, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  onChange={(e) => setActivite({ ...activite, dateDebut: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin prévue
                </label>
                <input
                  type="date"
                  onChange={(e) => setActivite({ ...activite, dateFin: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Liste des sous-activités */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sous-activités</h3>
            <div className="space-y-4 mb-4">
              {activite.sousActivites.map((sa, index) => (
                <div key={sa.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{sa.nom}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveSousActivite(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{sa.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-blue-600">{sa.montantPrevu} €</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulaire d'ajout de sous-activité */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Ajouter une sous-activité</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    placeholder="Nom de la sous-activité"
                    value={newSousActivite.nom}
                    onChange={(e) => setNewSousActivite({ ...newSousActivite, nom: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Montant prévu"
                    value={newSousActivite.montantPrevu || ''}
                    onChange={(e) => setNewSousActivite({ ...newSousActivite, montantPrevu: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <textarea
                    placeholder="Description de la sous-activité"
                    value={newSousActivite.description}
                    onChange={(e) => setNewSousActivite({ ...newSousActivite, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddSousActivite}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter la sous-activité
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Montant total</span>
              <span className="text-2xl font-bold text-blue-600">{activite.montantTotal} €</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
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
              Créer l'activité
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewActivityModal;