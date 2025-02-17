import React from 'react';
import { X, Pencil, Trash2 } from 'lucide-react';
import type { Expense } from '../types/expense';
import type { SubActivity } from '../types/activity';

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  subActivity: SubActivity;
  onEdit: () => void;
  onDelete: () => void;
}

const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
  isOpen,
  onClose,
  expense,
  subActivity,
  onEdit,
  onDelete
}) => {
  if (!isOpen) return null;

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(parseFloat(amount));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">Détails de la dépense</h2>
            <p className="text-gray-600 mt-1">
              Sous-activité : {subActivity.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifier la dépense"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer la dépense"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Montant</h3>
              <p className="mt-1 text-lg font-semibold">
                {formatAmount(expense.amount)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Créé par</h3>
              <p className="mt-1">Utilisateur #{expense.created_by}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-6 text-sm text-gray-500">
              <div>
                <p>Créée le {formatDate(expense.created_at)}</p>
              </div>
              <div>
                <p>Dernière modification le {formatDate(expense.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailsModal;