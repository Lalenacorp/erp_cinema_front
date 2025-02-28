import type { GapSummary } from '../types/gapReport';

const API_URL = 'http://13.38.119.12/api';

export const gapReportService = {
  async listGapReports(): Promise<GapSummary[]> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(`${API_URL}/erp/gap_summary/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports d\'écarts:', error);
      throw error;
    }
  },
  
  async getProjectGapSummary(projectId: string | number): Promise<GapSummary[]> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(`${API_URL}/erp/gap_summary/?project=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des écarts pour le projet ${projectId}:`, error);
      throw error;
    }
  },

  async getActivityGapSummary(activityId: string | number): Promise<GapSummary[]> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(`${API_URL}/erp/gap_summary/?activity=${activityId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des écarts pour le projet ${activityId}:`, error);
      throw error;
    }
  }
};