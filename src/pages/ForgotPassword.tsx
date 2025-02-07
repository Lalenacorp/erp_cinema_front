import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Mail, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Réinitialise les erreurs avant chaque soumission
    setIsLoading(true);

    try {
      // Appel du service de réinitialisation de mot de passe
      await authService.requestPasswordReset(email);
      setIsEmailSent(true); // L'email a été envoyé avec succès
    } catch (error: any) {
      // Gestion des erreurs d'API
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false); // Arrête l'animation de chargement
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Film className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Mot de passe oublié
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {!isEmailSent
            ? "Entrez votre adresse email pour réinitialiser votre mot de passe"
            : "Un email de réinitialisation vous a été envoyé"
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!isEmailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="exemple@email.com"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div> // Affichage des erreurs
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-3 mx-auto w-fit">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Vérifiez votre boîte mail</h3>
              <p className="mt-2 text-sm text-gray-600">
                Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
                Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez votre dossier spam.
              </p>
            </div>
          )}

          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
