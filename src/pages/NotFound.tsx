import React from 'react';
import { Link } from 'react-router-dom';
import  Dashboard  from './Dashboard';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <p className="text-2xl font-semibold text-gray-600 mt-4">Page non trouvée</p>
        <p className="text-gray-500 mt-2">La page que vous recherchez n'existe pas.</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
        
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}