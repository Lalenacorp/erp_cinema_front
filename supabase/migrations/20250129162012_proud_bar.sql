/*
  # User Groups and Permissions System

  1. New Tables
    - `groups`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `permissions`
      - `id` (uuid, primary key) 
      - `name` (text, unique)
      - `description` (text)
      - `resource` (text) - The resource this permission applies to (e.g., 'projects', 'activities')
      - `action` (text) - The action allowed (e.g., 'read', 'write', 'delete')
      - `created_at` (timestamp)

    - `group_permissions`
      - Links groups to their permissions
      - `group_id` (uuid, references groups)
      - `permission_id` (uuid, references permissions)
      - Composite primary key (group_id, permission_id)

    - `user_groups`
      - Links users to their groups
      - `user_id` (uuid, references auth.users)
      - `group_id` (uuid, references groups)
      - Composite primary key (user_id, group_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(resource, action)
);

-- Create group_permissions junction table
CREATE TABLE IF NOT EXISTS group_permissions (
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, permission_id)
);

-- Create user_groups junction table
CREATE TABLE IF NOT EXISTS user_groups (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, group_id)
);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to authenticated users" ON groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to authenticated users" ON permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to authenticated users" ON group_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to authenticated users" ON user_groups
  FOR SELECT TO authenticated USING (true);

-- Create function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(user_id uuid, required_resource text, required_action text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_groups ug
    JOIN group_permissions gp ON ug.group_id = gp.group_id
    JOIN permissions p ON gp.permission_id = p.id
    WHERE ug.user_id = $1
    AND p.resource = $2
    AND p.action = $3
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default groups
INSERT INTO groups (name, description) VALUES
  ('Administrateurs', 'Accès complet à toutes les fonctionnalités'),
  ('Chefs de projet', 'Gestion complète des projets'),
  ('Membres', 'Accès en lecture aux projets et activités');

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('Voir les projets', 'Permet de voir la liste des projets', 'projects', 'read'),
  ('Créer des projets', 'Permet de créer de nouveaux projets', 'projects', 'create'),
  ('Modifier les projets', 'Permet de modifier les projets existants', 'projects', 'update'),
  ('Supprimer les projets', 'Permet de supprimer des projets', 'projects', 'delete'),
  ('Voir les activités', 'Permet de voir les activités', 'activities', 'read'),
  ('Gérer les activités', 'Permet de créer/modifier/supprimer des activités', 'activities', 'write'),
  ('Voir les dépenses', 'Permet de voir les dépenses', 'expenses', 'read'),
  ('Gérer les dépenses', 'Permet de créer/modifier/supprimer des dépenses', 'expenses', 'write'),
  ('Gérer les utilisateurs', 'Permet de gérer les utilisateurs et leurs permissions', 'users', 'manage');

-- Assign permissions to default groups
WITH admin_group AS (SELECT id FROM groups WHERE name = 'Administrateurs'),
     chef_group AS (SELECT id FROM groups WHERE name = 'Chefs de projet'),
     member_group AS (SELECT id FROM groups WHERE name = 'Membres')
INSERT INTO group_permissions (group_id, permission_id)
SELECT 
  admin_group.id,
  permissions.id
FROM admin_group, permissions
UNION ALL
SELECT 
  chef_group.id,
  permissions.id
FROM chef_group, permissions
WHERE permissions.resource != 'users'
UNION ALL
SELECT 
  member_group.id,
  permissions.id
FROM member_group, permissions
WHERE permissions.action = 'read';