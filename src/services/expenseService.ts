import axios from 'axios';
import type { Expense } from '../types/expense';
import { authService } from './authService';

const BASE_URL = 'http://13.38.119.12/api/erp';

export const expenseService = {
  async listExpenses(projectId: string): Promise<Expense[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
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
      console.error('Error fetching expenses:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }
};