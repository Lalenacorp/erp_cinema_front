import { authService } from "../services/authService"; // Assurez-vous que authService est bien importé

// Types d'erreurs possibles
export type ApiError = {
  message: string;
  code: string;
};

// Configuration de base pour les requêtes API
const API_CONFIG = {
  baseUrl: 'http://13.38.119.12',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout : 20000,
};



// Fonction utilitaire pour gérer les erreurs
const handleApiError = (error: any): never => {
  if (error.response) {
    // Erreur de l'API avec une réponse
    const apiError: ApiError = {
      message: error.response.data.detail || error.response.data.message || 'Une erreur est survenue',
      code: error.response.status.toString(),
    };
    throw apiError;
  }

  // Erreur réseau ou autre
  const apiError: ApiError = {
    message: error.message || 'Une erreur est survenue',
    code: 'NETWORK_ERROR',
  };
  throw apiError;
};

// Fonction pour rafraîchir le token d'accès
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token manquant');
    }

    const response = await fetch(`${API_CONFIG.baseUrl}/api/token/refresh/`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du rafraîchissement du token');
    }

    const data = await response.json();
    if (data && data.access) {
      authService.setTokens(data); // Enregistre les nouveaux tokens
      return data.access; // Retourne le nouveau token d'accès
    } else {
      throw new Error('Le token d\'accès est manquant dans la réponse de rafraîchissement');
    }
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    throw error;
  }
};

// Fonction utilitaire pour les requêtes HTTP
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = authService.getToken();
  const headers = {
    ...API_CONFIG.headers,
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré ou invalide, tenter de rafraîchir le token
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          // Retente la requête avec le nouveau token d'accès
          const retryResponse = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          });

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json();
            throw {
              response: {
                status: retryResponse.status,
                data: errorData,
              },
            };
          }
          return retryResponse.json();
        }
        throw new Error('Échec du rafraîchissement du token');
      }

      const errorData = await response.json();
      throw {
        response: {
          status: response.status,
          data: errorData,
        },
      };
    }

    return response.json();
  } catch (error) {
    handleApiError(error);
  }
};

// API Client
export const api = {
  get: (endpoint: string, options: RequestInit = {}): Promise<any> => fetchWithAuth(endpoint, options),

  post: (endpoint: string, data?: any) => fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  put: (endpoint: string, data?: any) => fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  patch: (endpoint: string, data?: any, options?: RequestInit) => fetchWithAuth(endpoint, { method: 'PATCH', body: JSON.stringify(data), ...options }),

  delete: (endpoint: string, options?: RequestInit) => fetchWithAuth(endpoint, { method: 'DELETE', ...options }), // ici la méthode DELETE
};
