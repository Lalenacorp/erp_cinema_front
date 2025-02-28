import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Project, ProjectStatus } from '../types';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import { apiService } from '../services/apiService';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSubmit: (updatedProject: Project) => void;
}

const CURRENCIES = [
  { code: 'FCFA', label: 'FCFA', rate: '650' },
  { code: 'Euro', label: 'Euro (€)', rate: '1' },
  { code: 'Dollar', label: 'Dollar ($)', rate: '600' }
];

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    status: project.status || 'prepa',
    budget: project.budget,
    currency: project.currency,
    exchange_rate: project.exchange_rate,
    started_at: project.started_at?.split('T')[0] || '',
    achieved_at: project.achieved_at?.split('T')[0] || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
  setFormData({
    name: project.name,
    description: project.description || '',
    status: project.status || 'prepa',
    budget: project.budget,
    currency: project.currency,
    exchange_rate: project.exchange_rate,
    started_at: project.started_at?.split('T')[0] || '',
    achieved_at: project.achieved_at?.split('T')[0] || ''
  });
}, [project]); // Mise à jour chaque fois que `project` change


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Le budget doit être supérieur à 0';
    }

    if (!formData.currency) {
      newErrors.currency = 'La devise est requise';
    }

    if (!formData.exchange_rate || parseFloat(formData.exchange_rate) <= 0) {
      newErrors.exchange_rate = 'Le taux de change doit être supérieur à 0';
    }

    if (formData.started_at && formData.achieved_at) {
      const startDate = new Date(formData.started_at);
      const endDate = new Date(formData.achieved_at);
      if (startDate > endDate) {
        newErrors.dates = 'La date de début doit être antérieure à la date de fin';
      }
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
      const updatedProject: Partial<Project> = {
        ...project,
        name: formData.name,
        description: formData.description || undefined, // Évite null
        status: formData.status as ProjectStatus,
        budget: formData.budget,
        currency: formData.currency,
        exchange_rate: formData.exchange_rate,
        started_at: formData.started_at ? new Date(formData.started_at).toISOString() : undefined,
        achieved_at: formData.achieved_at ? new Date(formData.achieved_at).toISOString() : undefined,
      };
  
      console.log("📤 Données envoyées à l'API:", updatedProject);
  
      // Appel API
      const response = await apiService.updateProject(project.id, updatedProject);
  
      // Rafraîchissement des données après mise à jour
      onSubmit(response);
  
      onClose();
      toast.success('Projet mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : "Impossible de mettre à jour le projet"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  

  const handleCurrencyChange = (currencyCode: string) => {
    const selectedCurrency = CURRENCIES.find(c => c.code === currencyCode);
    if (selectedCurrency) {
      setFormData(prev => ({
        ...prev,
        currency: currencyCode,
        exchange_rate: selectedCurrency.rate
      }));
      setErrors(prev => ({ ...prev, currency: '', exchange_rate: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Modifier le projet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <span className="text-red-500">La devise et le taux de change ne peuvent pas être modifiés</span>


        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.budget ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
              {errors.budget && (
                <p className="mt-1 text-sm text-red-500">{errors.budget}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ">
                Devise <span className="text-red-500"></span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-300 ${
                  errors.currency ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled
              >
                {CURRENCIES.map(({ code, label }) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-500">{errors.currency}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 ">
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taux de change <span className="text-red-500"></span>
            </label>
            <input
              type="number"
              value={formData.exchange_rate}
              onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-300 ${
                errors.exchange_rate ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              step="0.01"
              disabled
            />
            {errors.exchange_rate && (
              <p className="mt-1 text-sm text-red-500">{errors.exchange_rate}</p>
            )}
          </div>
        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="prepa">En préparation</option>
              <option value="pre-prod">Pré-production</option>
              <option value="prod">Production</option>
              <option value="post-prod">Post-production</option>
            </select>
          </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={formData.started_at}
                onChange={(e) => setFormData({ ...formData, started_at: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.dates ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={formData.achieved_at}
                onChange={(e) => setFormData({ ...formData, achieved_at: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.dates ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
            </div>
          </div>
          {errors.dates && (
            <p className="mt-1 text-sm text-red-500">{errors.dates}</p>
          )}

         

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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
