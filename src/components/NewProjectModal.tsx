import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Project } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id'>) => void;
}

type ProjectStatus = NonNullable<Project['status']>;

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [project, setProject] = useState({
    name: '',
    description: '',
    dateDebut: new Date().toISOString().split('T')[0],
    status: 'prepa' as ProjectStatus,
    budget: '0.00',
    current_expenses: '0.00',
    budget_gap: '0.00',
    currency: 'Euro',
    exchange_rate: '1.00',
    managed_by: 1,
    activites: []
  });
  const [error, setError] = useState<string | null>(null);

  const getToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const token = getToken();
      
      if (!token) {
        setError("Vous n'êtes pas connecté. Veuillez vous reconnecter.");
        return;
      }

      const response = await fetch('http://13.38.119.12/api/erp/create_project/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (response.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Erreur lors de la création du projet');
      }

      const data = await response.json();
      onSubmit(data);
      onClose();
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nouveau Projet</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du projet *
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={project.description || ''}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début *
            </label>
            <input
              type="date"
              value={project.dateDebut}
              onChange={(e) => setProject({ ...project, dateDebut: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (€) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={parseFloat(project.budget)}
              onChange={(e) => {
                const value = e.target.value === '' ? '0.00' : parseFloat(e.target.value).toFixed(2);
                setProject({ ...project, budget: value });
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut *
            </label>
            <select
              value={project.status}
              onChange={(e) => setProject({ ...project, status: e.target.value as ProjectStatus })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="prepa">Préparation</option>
              <option value="pre-prod">Pré-production</option>
              <option value="prod">Production</option>
              <option value="post-prod">Post-production</option>
            </select>
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