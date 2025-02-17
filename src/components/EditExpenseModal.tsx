import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import type { Depense } from '../types/auth';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Depense;
  onSubmit: (expenseId: string, updatedExpense: Depense) => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  onSubmit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedExpense, setEditedExpense] = useState<Depense>({...expense});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        alert('Seuls les fichiers PDF, JPEG et PNG sont acceptés');
        return;
      }
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      setSelectedFile(file);
      setEditedExpense({ ...editedExpense, justificatif: file.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      // Convertir le fichier en base64 pour la simulation
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onSubmit(expense.id, {
          ...editedExpense,
          justificatif: base64String
        });
      };
      reader.readAsDataURL(selectedFile);
    } else {
      onSubmit(expense.id, editedExpense);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Modifier la dépense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={editedExpense.description}
              onChange={(e) => setEditedExpense({ ...editedExpense, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={editedExpense.montant}
              onChange={(e) => setEditedExpense({ ...editedExpense, montant: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={editedExpense.date.toISOString().split('T')[0]}
              onChange={(e) => setEditedExpense({ ...editedExpense, date: new Date(e.target.value) })}
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
                {!selectedFile && editedExpense.justificatif && (
                  <p className="text-sm text-gray-600">
                    Fichier actuel : {editedExpense.justificatif}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;