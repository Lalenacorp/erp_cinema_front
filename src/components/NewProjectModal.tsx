import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Project, ProjectStatus } from '../types';
import toast from 'react-hot-toast';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, "id">) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [project, setProject] = useState<Omit<Project, "id">>({
    name: '',
    description: null,
    budget: '0',
    status: 'prepa',
    managed_by: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dateDebut: new Date().toISOString(),
    current_expenses: null,
    budget_gap: null,
    currency: 'EUR',
    exchange_rate: '1',
    activites: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!project.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!project.budget || parseFloat(project.budget) <= 0) {
      newErrors.budget = 'Le budget doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    try {
      onSubmit(project);
    } catch (error) {
      toast.error("Erreur lors de la création du projet");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nouveau Projet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => {
                setProject({ ...project, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nom du projet"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={project.description || ''}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Description du projet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={project.budget}
              onChange={(e) => {
                setProject({ ...project, budget: e.target.value });
                setErrors({ ...errors, budget: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.budget ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              step="0.01"
              placeholder="Budget du projet"
            />
            {errors.budget && (
              <p className="mt-1 text-sm text-red-500">{errors.budget}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={project.status}
              onChange={(e) => setProject({ ...project, status: e.target.value as ProjectStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="prepa">En préparation</option>
              <option value="pre-prod">Pré-production</option>
              <option value="prod">Production</option>
              <option value="post-prod">Post-production</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer le projet
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;