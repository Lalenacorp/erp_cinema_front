import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Activity, SubActivity } from '../types';
import toast from 'react-hot-toast';

interface EditSubActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  subActivity: SubActivity | null;
  onSubmit: (updatedSubActivity: SubActivity) => void;
}

const EditSubActivityModal: React.FC<EditSubActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  subActivity,
  onSubmit
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string | null;
  }>({
    name: '',
    description: null
  });

  useEffect(() => {
    if (subActivity) {
      setFormData({
        name: subActivity.name || '',
        description: subActivity.description
      });
    }
  }, [subActivity]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subActivity || !validateForm()) {
      toast.error('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    try {
      // Create the update payload with only the fields that should be updated
      const updatedSubActivity: SubActivity = {
        ...subActivity,
        name: formData.name,
        description: formData.description
      };

      onSubmit(updatedSubActivity);
    } catch (error) {
      console.error('Error updating sub-activity:', error);
      toast.error("Erreur lors de la mise à jour de la sous-activité");
    }
  };

  if (!isOpen || !subActivity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Modifier la sous-activité</h2>
            <p className="text-gray-600 mt-1">Pour l'activité : {activity.name}</p>
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
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nom de la sous-activité"
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
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Description de la sous-activité"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubActivityModal;