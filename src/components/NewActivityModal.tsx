import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Activity, SubActivity, Project } from '../types/index';
import toast from 'react-hot-toast';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: Activity) => void;
  projects?: Project[];
  selectedProjectId?: string;
}

interface NewSubActivityForm extends Omit<SubActivity, 'id' | 'created_at' | 'updated_at'> {
  activity: number;
  name: string;
  description: string;
  amount_estimated: number;
  amount_spent: number;
  subactivity_gap: number;
  dateDebut: string;
  dateFin: string;
}

const initialSubActivityState: NewSubActivityForm = {
  activity: 0,
  name: '',
  description: '',
  amount_estimated: 0,
  amount_spent: 0,
  subactivity_gap: 0,
  dateDebut: '',
  dateFin: '',
};

const NewActivityModal: React.FC<NewActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects = [], 
  selectedProjectId
}) => {
  const [activity, setActivity] = useState<Omit<Activity, 'id'>>({
    project: selectedProjectId ? parseInt(selectedProjectId) : 0,
    name: '',
    description: '',
    total_amount_estimated: '0',
    total_amount_spent: '0',
    activity_gap: '0',
    activity_manager: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity_subactivity: [],
    managed_by: 1,
  });

  const [newSubActivity, setNewSubActivity] = useState<NewSubActivityForm>(initialSubActivityState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedProjectId) {
      setActivity(prev => ({ ...prev, project: parseInt(selectedProjectId) }));
    }
  }, [selectedProjectId]);

  const validateSubActivity = (subActivity: NewSubActivityForm): boolean => {
    const newErrors: Record<string, string> = {};

    if (!subActivity.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (subActivity.amount_estimated <= 0) {
      newErrors.amount_estimated = 'Le montant estimé doit être supérieur à 0';
    }

    if (subActivity.dateDebut && subActivity.dateFin) {
      const startDate = new Date(subActivity.dateDebut);
      const endDate = new Date(subActivity.dateFin);
      
      if (startDate > endDate) {
        newErrors.dates = 'La date de début doit être antérieure à la date de fin';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubActivity = () => {
    if (!validateSubActivity(newSubActivity)) {
      return;
    }

    const subActivityWithId: SubActivity = {
      ...newSubActivity,
      id: Math.floor(Math.random() * 10000),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const currentEstimated = activity.total_amount_estimated ? parseFloat(activity.total_amount_estimated) : 0;
    const newTotalEstimated = (currentEstimated + newSubActivity.amount_estimated).toString();

    setActivity(prev => ({
      ...prev,
      activity_subactivity: [...prev.activity_subactivity, subActivityWithId],
      total_amount_estimated: newTotalEstimated,
    }));

    setNewSubActivity(initialSubActivityState);
    setErrors({});
    toast.success('Sous-activité ajoutée');
  };

  const handleRemoveSubActivity = (index: number) => {
    const subActivityToRemove = activity.activity_subactivity[index];
    const updatedSubActivities = activity.activity_subactivity.filter((_, i) => i !== index);
    
    const currentEstimated = activity.total_amount_estimated ? parseFloat(activity.total_amount_estimated) : 0;
    const newTotalEstimated = (currentEstimated - subActivityToRemove.amount_estimated).toString();
    
    setActivity(prev => ({
      ...prev,
      activity_subactivity: updatedSubActivities,
      total_amount_estimated: newTotalEstimated,
    }));
    
    toast.success('Sous-activité supprimée');
  };

  const validateActivity = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!activity.name.trim()) {
      newErrors.activityName = "Le nom de l'activité est requis";
    }

    if (!activity.project) {
      newErrors.project = 'Le projet est requis';
    }

    if (activity.activity_subactivity.length === 0) {
      newErrors.subactivities = 'Au moins une sous-activité est requise';
    }

    if (!activity.activity_manager.trim()) {
      newErrors.activity_manager = 'Le responsable est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateActivity()) {
      toast.error('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    try {
      onSubmit(activity as Activity);
      toast.success('Activité créée avec succès');
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la création de l'activité");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nouvelle Activité</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Fermer"
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
              value={activity.project || ''}
              onChange={(e) => {
                setActivity({ ...activity, project: parseInt(e.target.value) });
                setErrors(prev => ({ ...prev, project: '' }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.project ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!!selectedProjectId}
            >
              <option value="">Sélectionnez un projet</option>
              {Array.isArray(projects) && projects.map((project) => (
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
              Nom de l'activité <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={activity.name}
              onChange={(e) => {
                setActivity({ ...activity, name: e.target.value });
                setErrors(prev => ({ ...prev, activityName: '' }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.activityName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Entrez le nom de l'activité"
            />
            {errors.activityName && (
              <p className="mt-1 text-sm text-red-500">{errors.activityName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={activity.description || ''}
              onChange={(e) => setActivity({ ...activity, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Décrivez l'activité"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsable de l'activité <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={activity.activity_manager}
              onChange={(e) => {
                setActivity({ ...activity, activity_manager: e.target.value });
                setErrors(prev => ({ ...prev, activity_manager: '' }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.activity_manager ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nom du responsable"
            />
            {errors.activity_manager && (
              <p className="mt-1 text-sm text-red-500">{errors.activity_manager}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sous-activités</h3>
              {errors.subactivities && (
                <p className="text-sm text-red-500">{errors.subactivities}</p>
              )}
            </div>

            <div className="space-y-4 mb-4">
              {activity.activity_subactivity.map((sa, index) => (
                <div key={sa.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{sa.name}</h4>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSubActivity(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Supprimer la sous-activité"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{sa.description}</p>
                    <p className="text-sm text-gray-600">
                      Montant estimé: {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(sa.amount_estimated)}
                    </p>
                    {sa.dateDebut && sa.dateFin && (
                      <p className="text-sm text-gray-600">
                        Période: {new Date(sa.dateDebut).toLocaleDateString()} - {new Date(sa.dateFin).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Ajouter une sous-activité
              </h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom de la sous-activité"
                  value={newSubActivity.name}
                  onChange={(e) => {
                    setNewSubActivity({ ...newSubActivity, name: e.target.value });
                    setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}

                <input
                  type="number"
                  placeholder="Montant estimé"
                  value={newSubActivity.amount_estimated || ''}
                  onChange={(e) => {
                    setNewSubActivity({ 
                      ...newSubActivity, 
                      amount_estimated: parseFloat(e.target.value) || 0 
                    });
                    setErrors(prev => ({ ...prev, amount_estimated: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.amount_estimated ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  step="0.01"
                />
                {errors.amount_estimated && (
                  <p className="mt-1 text-sm text-red-500">{errors.amount_estimated}</p>
                )}

                <textarea
                  placeholder="Description"
                  value={newSubActivity.description}
                  onChange={(e) => setNewSubActivity({ 
                    ...newSubActivity, 
                    description: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={newSubActivity.dateDebut}
                      onChange={(e) => {
                        setNewSubActivity({
                          ...newSubActivity,
                          dateDebut: e.target.value
                        });
                        setErrors(prev => ({ ...prev, dates: '' }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.dates ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={newSubActivity.dateFin}
                      onChange={(e) => {
                        setNewSubActivity({
                          ...newSubActivity,
                          dateFin: e.target.value
                        });
                        setErrors(prev => ({ ...prev, dates: '' }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.dates ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                {errors.dates && (
                  <p className="mt-1 text-sm text-red-500">{errors.dates}</p>
                )}

                <button
                  type="button"
                  onClick={handleAddSubActivity}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter la sous-activité
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer l'activité
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewActivityModal;