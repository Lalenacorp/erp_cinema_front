// Types d'erreurs possibles
export type ApiError = {
  message: string;
  code: string;
};

// Configuration de base pour les requêtes API
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Fonction utilitaire pour gérer les erreurs
const handleApiError = (error: any): never => {
  if (error.response) {
    // Erreur de l'API avec une réponse
    const apiError: ApiError = {
      message: error.response.data.detail || error.response.data.message || 'Une erreur est survenue',
      code: error.response.status.toString()
    };
    throw apiError;
  }
  
  // Erreur réseau ou autre
  const apiError: ApiError = {
    message: error.message || 'Une erreur est survenue',
    code: 'NETWORK_ERROR'
  };
  throw apiError;
};

// Fonction utilitaire pour les requêtes HTTP
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  const headers = {
    ...API_CONFIG.headers,
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré ou invalide
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        throw new Error('Session expirée');
      }

      const errorData = await response.json();
      throw {
        response: {
          status: response.status,
          data: errorData
        }
      };
    }

    return response.json();
  } catch (error) {
    handleApiError(error);
  }
};

// API Client
export const api = {
  get: (endpoint: string) => fetchWithAuth(endpoint),
  
  post: (endpoint: string, data?: any) => fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  put: (endpoint: string, data?: any) => fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (endpoint: string) => fetchWithAuth(endpoint, {
    method: 'DELETE'
  })
};