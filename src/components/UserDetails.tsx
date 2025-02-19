import React, { useState, useEffect } from 'react';
import { X, Pencil, Trash2, Save, XCircle, User as UserIcon, Mail, UserCheck, Users } from 'lucide-react';
import { authService } from '../services/authService';
import { User, Group } from '../types/auth';

interface UserDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUserDeleted?: () => void;
  onUserUpdated?: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ 
  isOpen, 
  onClose, 
  userId,
  onUserDeleted,
  onUserUpdated 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUser();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (user) {
      setEditedUser({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      });
    }
  }, [user]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const fetchedUser = await authService.getUserById(userId);
      console.log('Données de l\'utilisateur récupérées : ', fetchedUser);
      setUser(fetchedUser);
      setError(null);
    } catch (err: any) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur :', err.message);
      setError('Erreur lors de la récupération de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditedUser({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await authService.updateUser(userId, editedUser);
      await loadUser();
      setIsEditing(false);
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la mise à jour de l\'utilisateur :', err.message);
      setError('Erreur lors de la mise à jour de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      setIsLoading(true);
      await authService.deleteUser(userId);
      if (onUserDeleted) {
        onUserDeleted();
      }
      onClose();
    } catch (err: any) {
      console.error('❌ Erreur lors de la suppression de l\'utilisateur :', err.message);
      setError('Erreur lors de la suppression de l\'utilisateur');
      setIsDeleting(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof editedUser, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm">
      <div 
        className="fixed inset-0 transition-opacity"
        onClick={isEditing ? undefined : onClose}
      />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Modifier l\'utilisateur' : 'Détails de l\'utilisateur'}
              </h2>
            </div>
            {!isEditing && (
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : !user ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl">
                Utilisateur non trouvé
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {/* Main Info Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <UserCheck className="h-4 w-4 text-gray-400" />
                        Nom d'utilisateur
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser.username || ''}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Nom d'utilisateur"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-white rounded-lg border border-gray-100">{user.username}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedUser.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Email"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-white rounded-lg border border-gray-100">{user.email}</p>
                      )}
                    </div>

                    {/* First Name Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        Prénom
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser.first_name || ''}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Prénom"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-white rounded-lg border border-gray-100">{user.first_name}</p>
                      )}
                    </div>

                    {/* Last Name Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        Nom
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser.last_name || ''}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Nom"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-white rounded-lg border border-gray-100">{user.last_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Groups Section */}
                  {!isEditing && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Users className="h-4 w-4 text-gray-400" />
                        Groupes
                      </label>
                      {Array.isArray(user.groups) && user.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.groups.map((group, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                            >
                              {typeof group === 'string' ? group : group.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Aucun groupe associé</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end items-center gap-3">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                        Modifier
                      </button>
                      <button
                        onClick={handleDelete}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                          ${isDeleting 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'text-red-600 hover:bg-red-50'
                          }`}
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting ? 'Confirmer' : 'Supprimer'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Annuler
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        Enregistrer
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
