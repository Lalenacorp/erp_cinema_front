import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Project } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id'>) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [project, setProject] = useState<Omit<Project, 'id'>>({
    nom: '',
    description: '',
    dateDebut: new Date(),
    dateFin: new Date(),
    statut: 'En préparation',
    budget: { 
      activites: [], 
      calculerTotal: () => project.budget.montantTotal || 0,
      montantTotal: 0,
      montantDepense: 0
    },
    activites: [],
    depenses: [],
    intervenants: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...project,
      budget: {
        ...project.budget,
        montantTotal: project.budget.montantTotal || 0
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nouveau Projet Cinématographique</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du projet *
            </label>
            <input
              type="text"
              value={project.nom}
              onChange={(e) => setProject({ ...project, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                type="date"
                onChange={(e) => setProject({ ...project, dateDebut: new Date(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin prévue *
              </label>
              <input
                type="date"
                onChange={(e) => setProject({ ...project, dateFin: new Date(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget total (€) *
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="Ex: 1000000"
                onChange={(e) => setProject({
                  ...project,
                  budget: {
                    ...project.budget,
                    montantTotal: parseFloat(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Ce budget servira de référence pour le projet
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut *
              </label>
              <select
                value={project.statut}
                onChange={(e) => setProject({ ...project, statut: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="En préparation">En préparation</option>
                <option value="Pré-production">Pré-production</option>
                <option value="Production">Production</option>
                <option value="Post-production">Post-production</option>
                <option value="Distribution">Distribution</option>
              </select>
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
              Créer le projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;