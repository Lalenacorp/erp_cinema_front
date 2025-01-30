/*
  # Schéma initial pour la gestion des projets cinématographiques

  1. Nouvelles Tables
    - `projects` : Table principale des projets
      - `id` (uuid, clé primaire)
      - `nom` (text, non null)
      - `description` (text)
      - `date_debut` (timestamptz)
      - `date_fin` (timestamptz)
      - `statut` (text)
      - `budget_total` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `activities` : Table des activités
      - `id` (uuid, clé primaire)
      - `project_id` (uuid, clé étrangère)
      - `nom` (text, non null)
      - `description` (text)
      - `montant_total` (numeric)
      - `statut` (text)
      - `date_debut` (timestamptz)
      - `date_fin` (timestamptz)
      - `created_at` (timestamptz)

    - `sub_activities` : Table des sous-activités
      - `id` (uuid, clé primaire)
      - `activity_id` (uuid, clé étrangère)
      - `intervenant_id` (uuid, clé étrangère)
      - `nom` (text, non null)
      - `description` (text)
      - `montant_prevu` (numeric)
      - `statut` (text)
      - `date_debut` (timestamptz)
      - `date_fin` (timestamptz)

    - `intervenants` : Table des intervenants
      - `id` (uuid, clé primaire)
      - `nom` (text, non null)
      - `role` (text)
      - `created_at` (timestamptz)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour permettre aux utilisateurs authentifiés de lire et modifier leurs données
*/

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  description text,
  date_debut timestamptz,
  date_fin timestamptz,
  statut text,
  budget_total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activities table
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  nom text NOT NULL,
  description text,
  montant_total numeric DEFAULT 0,
  statut text DEFAULT 'En attente',
  date_debut timestamptz,
  date_fin timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Intervenants table
CREATE TABLE intervenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  role text,
  created_at timestamptz DEFAULT now()
);

-- Sub-activities table
CREATE TABLE sub_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  intervenant_id uuid REFERENCES intervenants(id),
  nom text NOT NULL,
  description text,
  montant_prevu numeric DEFAULT 0,
  statut text DEFAULT 'En attente',
  date_debut timestamptz,
  date_fin timestamptz
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON projects
  FOR UPDATE
  TO authenticated
  USING (true);

-- Similar policies for other tables
CREATE POLICY "Enable read access for authenticated users" ON activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON activities
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();