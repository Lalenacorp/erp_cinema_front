import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { SubActivity } from '../types';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';

interface NewSubActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subActivity: SubActivity) => Promise<void>;
  activityId: number;
}

const NewSubActivityModal: React.FC<NewSubActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  activityId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount_estimated: '',
  
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.amount_estimated || parseFloat(formData.amount_estimated) <= 0) {
      newErrors.amount_estimated = 'Le montant estimé doit être supérieur à 0';
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

    try {
      // Create the sub-activity through the API
      const response = await apiService.createSubActivity(
        activityId,
        formData.name,
        parseFloat(formData.amount_estimated)
      );

      // If successful, update the parent component
      await onSubmit(response);
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        amount_estimated: '',
       
      });
      onClose();
      
      toast.success('Sous-activité créée avec succès');
    } catch (error) {
      toast.error("Erreur lors de la création de la sous-activité");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nouvelle Sous-activité</h2>
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Description de la sous-activité"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant estimé <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount_estimated}
              onChange={(e) => {
                setFormData({ ...formData, amount_estimated: e.target.value });
                setErrors({ ...errors, amount_estimated: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.amount_estimated ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              step="0.01"
              placeholder="Montant estimé"
            />
            {errors.amount_estimated && (
              <p className="mt-1 text-sm text-red-500">{errors.amount_estimated}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer la sous-activité
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewSubActivityModal;