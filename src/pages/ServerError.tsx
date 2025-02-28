import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Home } from 'lucide-react';

export default function ServerError() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-gray-800">500</h1>
        <p className="text-2xl font-semibold text-gray-600 mt-4">Erreur Serveur</p>
        <p className="text-gray-500 mt-2">
          Nous rencontrons actuellement des difficultés techniques. 
          Veuillez réessayer dans quelques instants.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={20} />
            Réessayer
          </button>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home size={20} />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}