import React, { useState, useEffect } from 'react';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  currentName: string;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({ isOpen, onClose, onSubmit, currentName }) => {
  const [groupName, setGroupName] = useState(currentName);

  // Lorsque currentName change, on met à jour groupName
  useEffect(() => {
    setGroupName(currentName);
  }, [currentName]);

  const handleSubmit = () => {
    if (groupName.trim()) {
      onSubmit(groupName); // Appelle la fonction parent avec le nouveau nom du groupe
      onClose(); // Ferme le modal
    } else {
      alert('Veuillez entrer un nom de groupe.');
    }
  };

  if (!isOpen) return null; // Si le modal n'est pas ouvert, ne rien afficher

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Modifier le groupe</h2>

        <div className="mb-4">
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">Nom du groupe</label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Nom du groupe"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGroupModal;
