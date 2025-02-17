// Re-export all types from their respective files
export * from './activity';
export * from './project';
export * from './auth';

// Common types
export type StatutActivite = 'En cours' | 'Terminée' | 'En attente';

// Project Status type
export type ProjectStatus = "prepa" | "pre-prod" | "prod" | "post-prod";