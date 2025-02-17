import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Project, Activity, SubActivity } from '../types';
import type { Expense } from '../types/expense';
import { useWebSocket } from '../hooks/useWebSocket';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Expense) => void;
  projects: Project[];
}

const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects
}) => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedSubActivity, setSelectedSubActivity] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser la connexion WebSocket quand un projet est sélectionné
  const ws = useWebSocket(selectedProject, (data) => {
    // Gérer les mises à jour WebSocket si nécessaire
    console.log('WebSocket update:', data);
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedProject('');
      setSelectedActivity('');
      setSelectedSubActivity('');
      setAmount('');
      setErrors({});
      setActivities([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Charger les activités quand un projet est sélectionné
  useEffect(() => {
    if (selectedProject) {
      loadActivities();
    } else {
      setActivities([]);
      setSelectedActivity('');
      setSelectedSubActivity('');
    }
  }, [selectedProject]);

  const loadActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const projectActivities = await apiService.listActivities();
      // Filtrer les activités pour ne garder que celles du projet sélectionné
      const filteredActivities = projectActivities.filter(
        activity => activity.project === parseInt(selectedProject)
      );
      setActivities(filteredActivities);
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
      if (!ws) {
        throw new Error('La connexion WebSocket n\'est pas disponible');
      }

      // Correction du format du message selon la documentation
      const message = {
        action: 'update_expense',
        subactivity_id: parseInt(selectedSubActivity),
        amount_spent: parseFloat(amount)
      };

      ws.send(JSON.stringify(message));

      // Réinitialiser le formulaire et fermer le modal
      setAmount('');
      setSelectedSubActivity('');
      onClose();
      toast.success('Dépense créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la dépense:', error);
      toast.error("Erreur lors de la création de la dépense");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
          {/* Sélection du projet */}
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

          {/* Sélection de l'activité */}
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
              disabled={!selectedProject || isLoadingActivities || isSubmitting}
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

          {/* Sélection de la sous-activité */}
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
              {activities
                .find(a => a.id.toString() === selectedActivity)
                ?.activity_subactivity.map((subActivity) => (
                  <option key={subActivity.id} value={subActivity.id}>
                    {subActivity.name}
                  </option>
                ))}
            </select>
            {errors.subactivity && (
              <p className="mt-1 text-sm text-red-500">{errors.subactivity}</p>
            )}
          </div>

          {/* Montant */}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Création...
                </>
              ) : (
                'Créer la dépense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExpenseModal;

