export interface Expense {
  id: number;
  amount: string;
  created_at: string;
  updated_at: string;
  subactivity: number;
  created_by: number;
}

export interface ExpenseUpdateResponse {
  project_id: string;
  current_expenses: string;
  budget_gap: string;
  activity_gap: string;
  activity_id: number;
  activity_total_amount_estimated: string;
  activity_total_amount_spent: string;
  subactivity_id: number;
  subactivity_amount_estimated: string;
  subactivity_amount_spent: string;
  subactivity_gap: string;
}