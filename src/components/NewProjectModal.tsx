import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Project, ProjectStatus } from '../types';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService'; 
import { authService} from '../services/authService';
import {User} from '../types/auth'


interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, "id">) => void;
}

interface ApiResponse {
  data: User[];
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [project, setProject] = useState<Omit<Project, "id">>({
    name: '',
    description: '',
    budget: '0',
    status: 'prepa',
    managed_by: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    current_expenses: null,
    budget_gap: null,
    currency: '',
    exchange_rate: '',
    activites: [],
    started_at: '',
    achieved_at: ''
  });


  const CURRENCIES = [
    { code: 'FCFA', label: 'FCFA', rate: '650' },
    { code: 'Euro', label: 'Euro (€)', rate: '1' },
    { code: 'Dollars', label: 'Dollar ($)', rate: '600' }
  ];

  const [users, setUsers] = useState<any[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!project.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!project.budget || parseFloat(project.budget) <= 0) {
      newErrors.budget = 'Le budget doit être supérieur à 0';
    }

    if (!project.currency) {
      newErrors.currency = 'La devise est requise';
    }

    if (!project.exchange_rate || parseFloat(project.exchange_rate) <= 0) {
      newErrors.exchange_rate = 'Le taux de conversion doit être supérieur à 0';
    }

    if (!project.started_at) {
      newErrors.started_at = 'La date de début est requise';
    }

    if (project.started_at && project.achieved_at) {
      const startDate = new Date(project.started_at);
      const endDate = new Date(project.achieved_at);
      if (startDate > endDate) {
        newErrors.dates = 'La date de début doit être antérieure à la date de fin';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Données du formulaire avant envoi:", project);
  
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs avant de continuer');
      return;
    }
  
    try {
      const projectData = {
        ...project,
        name: project.name,
        description: project.description,
        budget: project.budget.toString(),
        started_at: project.started_at,
        achieved_at: project.achieved_at,
        currency: project.currency,
        exchange_rate: project.exchange_rate,
        managed_by: 1
      };
  
      // Appel de la fonction createProject depuis projectService
      const response = await projectService.createProject(projectData); // Notez l'utilisation de projectService ici
      console.log("Réponse de l'API:", response);
      toast.success("Projet créé avec succès!");
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la création du projet");
      console.error("Erreur:", error);
    }
  };
  
  
  const handleCurrencyChange = (currencyCode: string) => {
    const selectedCurrency = CURRENCIES.find(c => c.code === currencyCode);
    if (selectedCurrency) {
      setProject({
        ...project,
        currency: currencyCode,
        exchange_rate: selectedCurrency.rate
      });
      setErrors({ ...errors, currency: '', exchange_rate: '' });
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authService.getAllUsers();
        setUsers(response); // Directement assigner le tableau
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs", error);
      }
    };
  
    fetchUsers();
  }, []);
  
  
  

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
    Géré par <span className="text-red-500">*</span>
  </label>
  <select
    value={project.managed_by}
    onChange={(e) => setProject({ ...project, managed_by: Number(e.target.value) })}
    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
      errors.managed_by ? 'border-red-500' : 'border-gray-300'
    }`}
  >
    <option value="">Sélectionner un utilisateur</option>
    {users.map((user) => (
      <option key={user.id} value={user.id}>
        {user.first_name} {user.last_name} {/* Utilisez first_name et last_name */}
      </option>
    ))}
  </select>
  {errors.managed_by && (
    <p className="mt-1 text-sm text-red-500">{errors.managed_by}</p>
  )}
</div>



          <div className="grid grid-cols-2 gap-4">
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
                Devise <span className="text-red-500">*</span>
              </label>
              <select
                value={project.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.currency ? 'border-red-500' : 'border-gray-300'
                }`}
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
          
          <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taux de conversion (FCFA/Devise) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={project.exchange_rate}
                onChange={(e) => {
                  setProject({ ...project, exchange_rate: e.target.value });
                  setErrors({ ...errors, exchange_rate: '' });
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.exchange_rate ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0.000001"
                step="0.000001"
                placeholder="Taux de conversion"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">FCFA</span>
              </div>
            </div>
            {errors.exchange_rate && (
              <p className="mt-1 text-sm text-red-500">{errors.exchange_rate}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              1 {project.currency} = {project.exchange_rate} FCFA
            </p>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
          type="date"
          value={project.started_at}
          onChange={(e) => {
            const newDate = e.target.value; // This will be in YYYY-MM-DD format
            setProject({
              ...project,
              started_at: newDate
            });
            setErrors({ ...errors, dates: '' });
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.dates ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.started_at && (
          <p className="mt-1 text-sm text-red-500">{errors.started_at}</p>
        )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
          type="date"
          value={project.achieved_at}
          onChange={(e) => {
            const newDate = e.target.value; // This will be in YYYY-MM-DD format
            setProject({
              ...project,
              achieved_at: newDate
            });
            setErrors({ ...errors, dates: '' });
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.dates ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.achieved_at && (
          <p className="mt-1 text-sm text-red-500">{errors.achieved_at}</p>
        )}
          </div>
         
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