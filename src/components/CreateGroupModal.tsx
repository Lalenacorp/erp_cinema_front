import React, { useState } from 'react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name);  // Appeler la fonction pour créer le groupe
      setName('');      // Réinitialiser le champ
      onClose();        // Fermer le modal
    } else {
      alert('Le nom du groupe ne peut pas être vide');
    }
  };

  if (!isOpen) return null;  // Ne pas afficher le modal si `isOpen` est false

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Créer un Groupe</h2>
        <div>
          <label htmlFor="group-name" className="block text-gray-700 mb-2">
            Nom du groupe
          </label>
          <input
            id="group-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Nom du groupe"
          />
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md">
            Annuler
          </button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Créer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
