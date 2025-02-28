import axios from 'axios';
import type { Expense } from '../types/expense';
import { authService } from './authService';

const BASE_URL = 'http://13.38.119.12/api/erp';

export const expenseService = {
  async listExpenses(projectId: string): Promise<Expense[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    try {
      const response = await axios.get(`${BASE_URL}/list_expenses/${projectId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des dépenses:', error);
      throw new Error(error.response?.data?.message || 'Impossible de récupérer les dépenses');
    }
  },

  async createExpense(projectId: number, subactivityId: number, amount: number, name: string): Promise<Expense> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/create_expense/`,
        {
          project_id: projectId,
          subactivity_id: subactivityId,
          amount,
          name
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la création de la dépense:', error);
      throw new Error(error.response?.data?.message || 'Impossible de créer la dépense');
    }
  },

  async updateExpense(expenseId: number, data: Partial<Expense>): Promise<Expense> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    try {
      const response = await axios.patch(
        `${BASE_URL}/update_expense/${expenseId}/`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la dépense:', error);
      throw new Error(error.response?.data?.message || 'Impossible de mettre à jour la dépense');
    }
  },

  async deleteExpense(expenseId: number): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    try {
      await axios.delete(`${BASE_URL}/delete_expense/${expenseId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la dépense:', error);
      throw new Error(error.response?.data?.message || 'Impossible de supprimer la dépense');
    }
  },



};