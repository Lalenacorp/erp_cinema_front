import React, { useState, useEffect } from 'react';
import { Project } from '../types/project';
import { ExpenseUpdateResponse, Expense } from '../types/expense';
import { X } from 'lucide-react';
import { Activity } from '../types/activity';
import { activityService } from '../services/activityService';
import toast from 'react-hot-toast';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onExpenseUpdate: (data: ExpenseUpdateResponse) => void;
  expenses?: Expense[];
  token: string;
}

const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  projects,
  onExpenseUpdate,
  expenses = [],
  token,
}) => {
  if (!isOpen) return null;

  const [amountSpent, setAmountSpent] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [proofPayment, setProofPayment] = useState<File | null>(null);

  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedSubActivity, setSelectedSubActivity] = useState<string>('');
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [activities, setActivities] = useState<Activity[]>([]);
  const [subActivities, setSubActivities] = useState<Activity['activity_subactivity']>([]);

  useEffect(() => {
    if (selectedProject) {
      loadActivities();
    } else {
      setActivities([]);
      setSubActivities([]);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedActivity) {
      const activity = activities.find(a => a.id.toString() === selectedActivity);
      setSubActivities(activity?.activity_subactivity || []);
    } else {
      setSubActivities([]);
    }
  }, [selectedActivity, activities]);

  const loadActivities = async () => {
    if (!selectedProject) return;

    setIsLoadingActivities(true);
    try {
      const allActivities = await activityService.listActivities();
      const projectActivities = allActivities.filter(
        activity => activity.project === parseInt(selectedProject)
      );
      setActivities(projectActivities);
      setError(null);
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
    if (!amountSpent || parseFloat(amountSpent) <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    }
    if (!proofPayment) {
      newErrors.file = 'La preuve de paiement est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (!validateForm()) {
        return;
      }

      const formData = new FormData();
      formData.append('action', 'update_expense');
      formData.append('subactivity_id', selectedSubActivity);
      formData.append('amount_spent', amountSpent);
      formData.append('name', name);
      formData.append('proof_payment', proofPayment);

      await sendFormData(formData);
      
      // Réinitialiser le formulaire après succès
      setSelectedProject('');
      setSelectedActivity('');
      setSelectedSubActivity('');
      setAmountSpent('');
      setName('');
      setProofPayment(null);
      
      onClose();
      toast.success('Dépense ajoutée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la dépense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendFormData = async (formData: FormData) => {
    const token = localStorage.getItem('auth_token');
    const ws = new WebSocket(`ws://13.38.119.12/ws/project/${selectedProject}/?token=${token}`);
  
    return new Promise((resolve, reject) => {
      ws.onopen = async () => {
        console.log('✅ WebSocket connecté');
    
        const file = formData.get('proof_payment') as File | null;
        if (!file) {
          reject(new Error('Aucun fichier sélectionné'));
          return;
        }
    
        const fileData = await file.arrayBuffer();
        ws.send(fileData);
        console.log('📂 Fichier envoyé :', file.name);
    
        ws.onmessage = async (event) => {
          const response = JSON.parse(event.data);
          console.log('📩 Réponse du serveur :', response);
    
          if (response.file_url) {
            const metadata = {
              action: 'update_expense',
              subactivity_id: selectedSubActivity,
              amount_spent: amountSpent,
              name: name,
              proof_payment_url: response.file_url,
            };
    
            ws.send(JSON.stringify(metadata));
            console.log('📩 Métadonnées envoyées :', metadata);
            resolve(response);
          } else {
            reject(new Error('Erreur du serveur lors de l\'envoi du fichier'));
          }
        };
    
        ws.onerror = (error) => {
          console.error('❌ Erreur WebSocket :', error);
          reject(error);
        };
    
        ws.onclose = () => {
          console.log('🔒 WebSocket fermé');
        };
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Nouvelle dépense</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Montant dépensé <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amountSpent}
              onChange={(e) => setAmountSpent(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nom de la dépense <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Entrez le nom de la dépense"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Preuve de paiement (PDF) <span className="text-red-500">*</span>
            </label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              errors.file ? 'border-red-500' : 'border-gray-300'
            }`}>
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="proof-payment"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Sélectionner un fichier</span>
                    <input
                      id="proof-payment"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={(e) => setProofPayment(e.target.files?.[0] || null)}
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PDF jusqu'à 10MB</p>
                {proofPayment && (
                  <p className="text-sm text-gray-600">
                    Fichier sélectionné : {proofPayment.name}
                  </p>
                )}
              </div>
            </div>
            {errors.file && (
              <p className="mt-1 text-sm text-red-500">{errors.file}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExpenseModal;