import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users,
  Plus,
  Pencil,
  Trash2,
  Banknote
} from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import { apiService } from '../services/apiService';

import type { Project, Activity } from '../types';
import ActivityList from '../components/ActivityList';
import NewActivityModal from '../components/NewActivityModal';
import EditProjectModal from '../components/EditProjectModal';
import DeleteProjectModal from '../components/DeleteProjectModal';

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  budget: string;
  status?: ProjectStatus;
  currency?: string;
  exchange_rate?: string;
  started_at?: string;
  achieved_at?: string;
}
export type ProjectStatus = "prepa" | "pre-prod" | "prod" | "post-prod";
// Helper components for better organization
const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  bgColor, 
  iconColor, 
  children 
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
  children?: React.ReactNode;
}) => (
  <div className={`${bgColor} rounded-xl p-6`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`${iconColor} p-3 rounded-lg`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-semibold mt-1">{value}</p>
    {children}
  </div>
);

function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  // Modal states
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProjectData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch project details and activities in parallel
      const [projectData, activitiesData] = await Promise.all([
        apiService.getProjectDetails(id),
        apiService.listActivities()
      ]);
      
      // Filter activities to only show those belonging to this project
      const projectActivities = activitiesData.filter(
        activity => activity.project === parseInt(id)
      );
      
      setProject(projectData);
      setActivities(projectActivities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id, lastUpdate, loadProjectData]);

  const refreshData = () => {
    console.log("Rafraîchissement des données...");
    setLastUpdate(Date.now());
  };

  const formatDate = (date: string | undefined | null) => {
    if (!date) return 'Non définie';
    
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(date));
    } catch (error) {
      return 'Date invalide';
    }
  };

  const handleAddActivity = async (newActivity: Activity) => {
    if (!project) return;
  
    try {
      await apiService.createActivity(
        project.id, 
        newActivity.name, 
        newActivity.managed_by
      );
      
      refreshData();
      setIsNewActivityModalOpen(false);
      toast.success('Activité ajoutée avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout de l'activité";
      toast.error(errorMessage);
    }
  };

  const handleUpdateActivity = async (activityId: number, updatedActivity: Activity) => {
    if (!project) return;
    
    try {
      await apiService.updateActivity(activityId, {
        name: updatedActivity.name,
        description: updatedActivity.description || null
      });
      refreshData();
      toast.success('Activité mise à jour avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'activité";
      toast.error(errorMessage);
    }
  };

  const handleDeleteActivity = async (activityId: number) => {
    if (!project) return;
    
    try {
      await apiService.deleteActivity(activityId);
      refreshData();
      toast.success('Activité supprimée avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression de l'activité";
      toast.error(errorMessage);
    }
  };

const handleProjectUpdate = async (updatedProject: Project) => {
    console.log("🔍 handleProjectUpdate exécuté avec :", updatedProject);

    try {
      await apiService.updateProject(project!.id, updatedProject);
      
      console.log("✅ Projet mis à jour, rechargement des données...");
      await loadProjectData(); // Utiliser directement loadProjectData au lieu de refreshData

      setIsEditProjectModalOpen(false);
      toast.success('Projet mis à jour avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du projet";
      console.error("❌ Erreur de mise à jour:", errorMessage);
      toast.error(errorMessage);
    }
  };



  const handleDeleteProject = async () => {
    if (!project) return;
    
    setIsDeleting(true);
    try {
      await apiService.deleteProject(project.id);
      setIsDeleteProjectModalOpen(false);
      toast.success('Projet supprimé avec succès');
      navigate('/projets');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du projet";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          {error || 'Projet non trouvé'}
        </h2>
        <button
          onClick={() => navigate('/projets')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour aux projets
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Project Header */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
              <p className="text-gray-600">{project.description || "Aucune description"}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditProjectModalOpen(true)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => setIsDeleteProjectModalOpen(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <StatCard
              icon={Banknote}
              title="Budget total"
              value={`${project.budget} ${project.currency}`}
              bgColor="bg-blue-50"
              iconColor="bg-blue-100 text-blue-600"
            >
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dépensé :</span>
                  <span className="font-medium">
                    {project.current_expenses || '0'} {project.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Écart :</span>
                  <span className={`font-medium ${Number(project.budget_gap) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {project.budget_gap || '0'} {project.currency}
                  </span>
                </div>
              </div>
            </StatCard>

            <StatCard
              icon={Calendar}
              title="Date de début"
              value={formatDate(project.started_at)}
              bgColor="bg-green-50"
              iconColor="bg-green-100 text-green-600"
            />

            <StatCard
              icon={Users}
              title="Responsable"
              value={project.managed_by || 'Non assigné'}
              bgColor="bg-yellow-50"
              iconColor="bg-yellow-100 text-yellow-600"
            />

            <StatCard
              icon={Clock}
              title="Statut"
              value={project.status || 'Non défini'}
              bgColor="bg-red-50"
              iconColor="bg-red-100 text-red-600"
            />
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Activités</h2>
            <button
              onClick={() => setIsNewActivityModalOpen(true)}
              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une activité
            </button>
          </div>

          <ActivityList
            activities={activities}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        </div>
      </div>

      {/* Modals */}
      <NewActivityModal
        isOpen={isNewActivityModalOpen}
        onClose={() => setIsNewActivityModalOpen(false)}
        onSubmit={handleAddActivity}
        projects={[project]}
        selectedProjectId={project.id.toString()}
      />

      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        project={project}
        onSubmit={handleProjectUpdate}
      />

      <DeleteProjectModal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => setIsDeleteProjectModalOpen(false)}
        onConfirm={handleDeleteProject}
        projectName={project.name}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default ProjectDetails;