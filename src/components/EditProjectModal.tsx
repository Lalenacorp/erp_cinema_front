import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Project } from '../types/auth';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSubmit: (updatedProject: Project) => void;
}

type ProjectStatus = NonNullable<Project['status']>;

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSubmit
}) => {
  const [editedProject, setEditedProject] = useState<Project>({
    ...project,
    budget: project.budget?.toString() || '0'
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Réinitialiser les champs avec les données du projet à chaque ouverture du modal
  useEffect(() => {
    if (isOpen) {
      setEditedProject({
        ...project,
        budget: project.budget?.toString() || '0'
      });
      setError(null);
    }
  }, [isOpen, project]);

  // Méthode pour récupérer le token
  const getToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Utilisateur non authentifié');
      }

      const updatedProjectData = {
        ...editedProject,
        budget: editedProject.budget.toString(),
        updated_at: new Date().toISOString()
      };

      const response = await fetch(`http://13.38.119.12/api/erp/update_project/${project.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProjectData)
      });

      if (response.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Erreur lors de la modification du projet');
      }

      const data = await response.json();
      
      // Mettre à jour l'état local et l'état parent immédiatement
      onSubmit({
        ...data,
        budget: data.budget?.toString() || '0'
      });
      
      onClose();
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditedProject(prev => ({
      ...prev,
      budget: value === '' ? '0' : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Modifier le projet</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Fermer"
            disabled={isSubmitting}
          >
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
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du projet *
            </label>
            <input
              id="project-name"
              type="text"
              value={editedProject.name}
              onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="project-description"
              value={editedProject.description || ''}
              onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow min-h-[100px] resize-y"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="project-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date de début *
            </label>
            <input
              id="project-date"
              type="date"
              value={editedProject.dateDebut}
              onChange={(e) => setEditedProject({ ...editedProject, dateDebut: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="project-budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget (€) *
            </label>
            <input
              id="project-budget"
              type="number"
              min="0"
              step="0.01"
              value={editedProject.budget}
              onChange={handleBudgetChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut *
            </label>
            <select
              id="project-status"
              value={editedProject.status}
              onChange={(e) => setEditedProject({ ...editedProject, status: e.target.value as ProjectStatus })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
              required
              disabled={isSubmitting}
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
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;