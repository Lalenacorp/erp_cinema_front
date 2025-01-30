import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import type { Depense, Project, Activite, SousActivite } from '../types';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Depense, 'id'>) => void;
  projects: Project[];
  selectedProjectId?: string;
}

const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  selectedProjectId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expense, setExpense] = useState<Omit<Depense, 'id'>>({
    description: '',
    montant: 0,
    justificatif: '',
    date: new Date(),
    sousActiviteId: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState(selectedProjectId || '');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        alert('Seuls les fichiers PDF, JPEG et PNG sont acceptés');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      setSelectedFile(file);
      setExpense({ ...expense, justificatif: file.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!projectId) {
      alert('Veuillez sélectionner un projet');
      return;
    }

    if (!expense.sousActiviteId) {
      alert('Veuillez sélectionner une sous-activité');
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedFile) {
        const base64String = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        });

        await onSubmit({
          ...expense,
          justificatif: base64String
        });
      } else {
        await onSubmit(expense);
      }

      handleClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la dépense:', error);
      alert('Une erreur est survenue lors de l\'ajout de la dépense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setExpense({
      description: '',
      montant: 0,
      justificatif: '',
      date: new Date(),
      sousActiviteId: ''
    });
    setSelectedFile(null);
    setProjectId(selectedProjectId || '');
    setSelectedActivityId('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const selectedProject = projects.find(p => p.id === projectId);
  const selectedActivity = selectedProject?.activites.find(a => a.id === selectedActivityId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nouvelle Dépense</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du projet */}
          {!selectedProjectId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Projet *
              </label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setSelectedActivityId('');
                  setExpense(prev => ({ ...prev, sousActiviteId: '' }));
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez un projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sélection de l'activité */}
          {selectedProject && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activité *
              </label>
              <select
                value={selectedActivityId}
                onChange={(e) => {
                  setSelectedActivityId(e.target.value);
                  setExpense(prev => ({ ...prev, sousActiviteId: '' }));
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez une activité</option>
                {selectedProject.activites.map((activite) => (
                  <option key={activite.id} value={activite.id}>
                    {activite.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sélection de la sous-activité */}
          {selectedActivity && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sous-activité *
              </label>
              <select
                value={expense.sousActiviteId}
                onChange={(e) => setExpense({ ...expense, sousActiviteId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez une sous-activité</option>
                {selectedActivity.sousActivites.map((sousActivite) => (
                  <option key={sousActivite.id} value={sousActivite.id}>
                    {sousActivite.nom}
                  </option>
                ))}
              </select>
              {selectedActivity.sousActivites.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Aucune sous-activité n'existe pour cette activité. Veuillez d'abord créer une sous-activité.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={expense.description}
              onChange={(e) => setExpense({ ...expense, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (€) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={expense.montant || ''}
              onChange={(e) => setExpense({ ...expense, montant: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={expense.date.toISOString().split('T')[0]}
              onChange={(e) => setExpense({ ...expense, date: new Date(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justificatif
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                  >
                    {selectedFile ? 'Changer le fichier' : 'Télécharger un fichier'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG jusqu'à 5MB
                </p>
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    Fichier sélectionné : {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !selectedActivity || selectedActivity.sousActivites.length === 0}
            >
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter la dépense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExpenseModal;