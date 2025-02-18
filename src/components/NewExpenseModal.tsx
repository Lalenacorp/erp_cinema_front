import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Project, Activity } from '../types';
import type { ExpenseUpdateResponse } from '../types/expense';
import { useWebSocket } from '../hooks/useWebSocket';
import { activityService } from '../services/activityService';
import toast from 'react-hot-toast';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onExpenseUpdate: (data: ExpenseUpdateResponse) => void;
}

const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  projects,
  onExpenseUpdate
}) => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedSubActivity, setSelectedSubActivity] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  const ws = useWebSocket(selectedProject, onExpenseUpdate);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProject) {
      loadActivities();
    } else {
      setActivities([]);
    }
  }, [selectedProject]);

  const resetForm = () => {
    setSelectedProject('');
    setSelectedActivity('');
    setSelectedSubActivity('');
    setName('');
    setAmount('');
    setErrors({});
    setIsSubmitting(false);
    setActivities([]);
  };

  const loadActivities = async () => {
    if (!selectedProject) return;

    setIsLoadingActivities(true);
    try {
      const allActivities = await activityService.listActivities();
      const projectActivities = allActivities.filter(
        activity => activity.project === parseInt(selectedProject)
      );
      setActivities(projectActivities);
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
      toast.error('Erreur lors du chargement des activités');
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedProject) {
      newErrors.project = 'Le projet est requis';
    }
    if (!selectedActivity) {
      newErrors.activity = "L'activité est requise";
    }
    if (!selectedSubActivity) {
      newErrors.subactivity = 'La sous-activité est requise';
    }
    if (!name.trim()) {
      newErrors.name = 'Le nom de la dépense est requis';
    }
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!ws.isConnected) {
        throw new Error('La connexion WebSocket n\'est pas disponible');
      }

      const success = ws.updateExpense(
        parseInt(selectedSubActivity),
        parseFloat(amount),
        name.trim()
      );

      if (success) {
        resetForm();
        onClose();
        toast.success('Dépense ajoutée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la dépense:', error);
      toast.error("Erreur lors de l'ajout de la dépense");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedActivityData = activities.find(a => a.id.toString() === selectedActivity);
  const subActivities = selectedActivityData?.activity_subactivity || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Nouvelle dépense</h2>
            <p className="text-gray-600 mt-1">Ajoutez une nouvelle dépense</p>
          </div>
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
              Projet <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedActivity('');
                setSelectedSubActivity('');
                setErrors({ ...errors, project: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.project ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Sélectionnez un projet</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.project && (
              <p className="mt-1 text-sm text-red-500">{errors.project}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activité <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => {
                setSelectedActivity(e.target.value);
                setSelectedSubActivity('');
                setErrors({ ...errors, activity: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.activity ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!selectedProject || isSubmitting || isLoadingActivities}
            >
              <option value="">Sélectionnez une activité</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
            {errors.activity && (
              <p className="mt-1 text-sm text-red-500">{errors.activity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sous-activité <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSubActivity}
              onChange={(e) => {
                setSelectedSubActivity(e.target.value);
                setErrors({ ...errors, subactivity: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.subactivity ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!selectedActivity || isSubmitting}
            >
              <option value="">Sélectionnez une sous-activité</option>
              {subActivities.map((subActivity) => (
                <option key={subActivity.id} value={subActivity.id}>
                  {subActivity.name}
                </option>
              ))}
            </select>
            {errors.subactivity && (
              <p className="mt-1 text-sm text-red-500">{errors.subactivity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la dépense <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Achat de matériel"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrors({ ...errors, amount: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              step="0.01"
              placeholder="Montant de la dépense"
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={isSubmitting || !ws.isConnected}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Ajout en cours...
                </>
              ) : (
                'Ajouter la dépense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExpenseModal;