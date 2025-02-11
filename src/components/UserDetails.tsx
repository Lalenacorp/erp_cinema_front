import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { User, Group } from '../types';
import { BarChart3, Clock, DollarSign, Users } from 'lucide-react';
const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Récupère l'ID de l'URL
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🆔 ID récupéré depuis les paramètres :", id); // Pour vérifier l'ID
    loadUser();
  }, [id]); // Effectue la récupération des données chaque fois que l'ID change

  const loadUser = async () => {
    if (!id) {
      setError('ID utilisateur non valide');
      return;
    }

    try {
      setIsLoading(true);
      console.log("📡 Appel API avec l'ID:", id);

      // Appel au service pour récupérer l'utilisateur
      const fetchedUser = await authService.getUserById(id);
      console.log("✅ Utilisateur récupéré :", fetchedUser);

      setUser(fetchedUser);
    } catch (err: any) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur :', err.message);
      setError('Erreur lors de la récupération de l\'utilisateur');
    } finally {
      setIsLoading(false); // Arrête le chargement
    }
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  // Affichage si l'utilisateur n'a pas été trouvé
  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
        Utilisateur non trouvé
      </div>
    );
  }

  // Affichage des détails de l'utilisateur
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Détails de l'utilisateur</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID</label>
            <p className="mt-1 text-gray-900">{user.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <p className="mt-1 text-gray-900">{user.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prénom</label>
            <p className="mt-1 text-gray-900">{user.first_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <p className="mt-1 text-gray-900">{user.last_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Groupes</label>
            {user.groups && user.groups.length > 0 ? (
              <ul>
                {user.groups.map((group: Group) => (
                  <li key={group.id} className="text-gray-900">
                    {group.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">Aucun groupe associé</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
