import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, File, Check } from 'lucide-react';
import { Project } from '../types/project';
import { Activity } from '../types/activity';
import { ExpenseUpdateResponse, Expense } from '../types/expense';
import { activityService } from '../services/activityService';
import toast from 'react-hot-toast';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onExpenseUpdate: (data: ExpenseUpdateResponse) => void;
  expenses?: Expense[];
}

const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  projects,
  onExpenseUpdate,
  expenses = [],
}) => {
  // State for form fields
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedSubActivity, setSelectedSubActivity] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [amountSpent, setAmountSpent] = useState<string>('');
  const [proofPayment, setProofPayment] = useState<File | null>(null);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Data states
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subActivities, setSubActivities] = useState<Activity['activity_subactivity']>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('action', 'update_expense');
      formData.append('subactivity_id', selectedSubActivity);
      formData.append('amount_spent', amountSpent);
      formData.append('name', name);
      formData.append('proof_payment', proofPayment);
      

      await sendFormData(formData);
     
      onClose();
      toast.success('Dépense ajoutée avec succès');
    } catch (err) {
      setError('Une erreur est survenue lors de l\'envoi des données.');
      toast.error('Erreur lors de l\'ajout de la dépense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont acceptés');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      setProofPayment(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont acceptés');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      setProofPayment(file);
      setError(null);
    }
  };

  const sendFormData = async (formData: FormData) => {
    const ws = new WebSocket(`ws://13.38.119.12/ws/project/${selectedProject}/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQwMDAxNDQxLCJpYXQiOjE3Mzk5OTA2NDEsImp0aSI6IjY5ZjM3MmNmZTAyNjQzMDViMzU2ZDA4OTBhYTEyZDg0IiwidXNlcl9pZCI6Mn0.E15SXCZgMuXlfEvM6XZDoUhIa0WNZukZN9_LQdJ7HzQ`);

    return new Promise((resolve, reject) => {
      ws.onopen = async () => {
        try {
          const metadata = {
            action: formData.get('action'),
            subactivity_id: formData.get('subactivity_id'),
            amount_spent: formData.get('amount_spent'),
            name: formData.get('name'),
          };

          const metadataJson = JSON.stringify(metadata);
          const metadataLength = new TextEncoder().encode(metadataJson).length;
          const metadataLengthBytes = new Uint8Array(4);
          new DataView(metadataLengthBytes.buffer).setUint32(0, metadataLength, false);

          const file = formData.get('proof_payment') as File;
          const fileData = await file.arrayBuffer();

          const combinedData = new Uint8Array(
            metadataLengthBytes.length + metadataJson.length + fileData.byteLength
          );

          combinedData.set(metadataLengthBytes, 0);
          combinedData.set(new TextEncoder().encode(metadataJson), metadataLengthBytes.length);
          combinedData.set(new Uint8Array(fileData), metadataLengthBytes.length + metadataJson.length);

          ws.send(combinedData);
      console.log('Données à envoyer', combinedData);

        } catch (error) {
          reject(error);
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onExpenseUpdate(data);
        resolve(data);
        ws.close();
      };

      ws.onerror = (error) => {
        reject(error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Nouvelle dépense</h2>
            <p className="text-gray-600 mt-1">Ajoutez une nouvelle dépense au projet</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
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
          <div className='grid grid-cols-2 gap-4'>
          <div >
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
              Montant dépensé <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amountSpent}
              onChange={(e) => {
                setAmountSpent(e.target.value);
                setErrors({ ...errors, amount: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Montant de la dépense"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preuve de paiement (PDF) <span className="text-red-500">*</span>
            </label>
            
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-2 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                  required
                  disabled={isSubmitting}
                />
                
                {proofPayment ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <File className="w-4 h-4 mr-2" />
                      {proofPayment.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Changer de fichier
                    </button>
                  </div>
                ) : (
                  <div 
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-8 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Téléverser un fichier</span>
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF uniquement (max. 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
            {errors.file && (
              <p className="mt-1 text-sm text-red-500">{errors.file}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Envoi en cours...
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
