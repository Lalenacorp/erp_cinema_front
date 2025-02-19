export interface Activity {
  id: number;
  activity_subactivity: SubActivity[];
  activity_manager: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  total_amount_estimated: string | null;
  total_amount_spent: string | null;
  activity_gap: string | null;
  project: number;
  managed_by: number;
  status?: 'En cours' | 'Terminée' | 'En attente';
}

export interface SubActivity {
  id: number;
  activity: number;
  name: string;
  description: string | null; 
  amount_estimated: string;
  amount_spent: string;
  subactivity_gap: string;
  created_at: string;
  updated_at: string;

}

export interface CreateActivityRequest {
  project: number;
  name: string;
  managed_by: number;
}

export interface UpdateActivityRequest {
  name?: string;
  description?: string | null;
}

export interface CreateSubActivityRequest {
  activity: number;
  name: string;
  amount_estimated: string;
}

export interface UpdateSubActivityRequest {
  name?: string;
  description?: string | null;
  amount_estimated?: string;
  amount_spent?: string;
  
}