export interface GapSummary {
	id: number;
	project: number;
	project_gap_summaries: string;
	activity: number | null;
	activity_gap_summaries?: string; //Ecart budgétaire par activité
	subactivity: number | null;
	subactivity_gap_summaries?: string; //Ecart budgétaire par sous-activité
	expense: number | null;
	expense_gap_summaries?: string;
	gap: string;
	created_at: string;
	updated_at: string;
  }
  
  export interface GapReportFilters {
	level: 'project' | 'activity' | 'subactivity' | 'expense';
	search: string;
	sortBy: keyof GapSummary;
	sortDirection: 'asc' | 'desc';
  }