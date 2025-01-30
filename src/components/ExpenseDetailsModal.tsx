import React from 'react';
import { X, FileText, Calendar, DollarSign, Link2, Pencil, Trash2 } from 'lucide-react';
import type { Depense, Project, Activite, SousActivite } from '../types';

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Depense;
  project?: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
  isOpen,
  onClose,
  expense,
  project,
  onEdit,
  onDelete
}) => {
  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleViewJustificatif = () => {
    if (expense.justificatif?.startsWith('data:')) {
      const byteString = atob(expense.justificatif.split(',')[1]);
      const mimeString = expense.justificatif.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  // Trouver l'activité et la sous-activité associées
  let foundActivity: Activite | undefined;
  let foundSubActivity: SousActivite | undefined;

  if (project) {
    for (const activity of project.activites) {
      const subActivity = activity.sousActivites.find(sa => sa.id === expense.sousActiviteId);
      if (subActivity) {
        foundActivity = activity;
        foundSubActivity = subActivity;
        break;
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold">Détails de la dépense</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
              title="Modifier"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{expense.description}</p>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Montant</span>
              </div>
              <p className="text-xl font-semibold text-blue-600">
                {formatAmount(expense.montant)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Date</span>
              </div>
              <p className="text-lg">{formatDate(expense.date)}</p>
            </div>
          </div>

          {/* Activité et sous-activité associées */}
          {foundActivity && foundSubActivity && (
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Link2 className="w-4 h-4" />
                <span className="text-sm">Activité et sous-activité associées</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-medium">Activité</h4>
                  <p className="text-sm text-gray-600">{foundActivity.nom}</p>
                </div>
                <div>
                  <h4 className="font-medium">Sous-activité</h4>
                  <p className="text-sm text-gray-600">{foundSubActivity.nom}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Responsable : {foundSubActivity.intervenant.nom}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Justificatif */}
          {expense.justificatif && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Justificatif</h3>
              <button
                onClick={handleViewJustificatif}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-blue-600 font-medium transition-colors"
              >
                <FileText className="w-5 h-5" />
                Voir le justificatif
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailsModal;