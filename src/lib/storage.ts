// Utilitaire pour la gestion du stockage local
const STORAGE_KEY = 'cinemanager_data';

interface StorageData {
  users: any[];
  projects: any[];
  activities: any[];
  expenses: any[];
  groups: any[];
  permissions: any[];
}

const defaultData: StorageData = {
  users: [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      groups: [
        {
          id: '1',
          name: 'Administrateurs',
          description: 'Accès complet à toutes les fonctionnalités',
          created_at: new Date()
        }
      ],
      permissions: []
    }
  ],
  projects: [],
  activities: [],
  expenses: [],
  groups: [
    {
      id: '1',
      name: 'Administrateurs',
      description: 'Accès complet à toutes les fonctionnalités',
      created_at: new Date()
    },
    {
      id: '2',
      name: 'Chefs de projet',
      description: 'Gestion complète des projets',
      created_at: new Date()
    },
    {
      id: '3',
      name: 'Membres',
      description: 'Accès en lecture aux projets et activités',
      created_at: new Date()
    }
  ],
  permissions: []
};

/* export const storage = {
  getData(): StorageData {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.setData(defaultData);
      return defaultData;
    }
    return JSON.parse(data, (key, value) => {
      // Convertir les dates stockées en string en objets Date
      if (key === 'dateDebut' || key === 'dateFin' || key === 'date' || key === 'created_at') {
        return new Date(value);
      }
      return value;
    });
  },

  setData(data: StorageData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  clearData(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}; */