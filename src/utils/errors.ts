export class ServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
  }
}

export async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (response.status >= 500) {
        throw new ServerError('Une erreur serveur est survenue');
      }
      throw new Error('Une erreur est survenue');
    }

    return response.json();
  } catch (error) {
    if (error instanceof ServerError) {
      throw error;
    }
    if (!navigator.onLine) {
      throw new ServerError('Pas de connexion internet');
    }
    throw error;
  }
}