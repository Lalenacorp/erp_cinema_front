import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  Users,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { projectService } from '../services/projectService';
import type { Project, Activity, SubActivity } from '../types';
import ActivityList from '../components/ActivityList';
import NewActivityModal from '../components/NewActivityModal';
import EditProjectModal from '../components/EditProjectModal';
import DeleteProjectModal from '../components/DeleteProjectModal';
import NewSubActivityModal from '../components/NewSubActivityModal';

function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [isNewSubActivityModalOpen, setIsNewSubActivityModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProject();
      loadSubActivities();
    }
  }, [id]);

  const loadProject = async () => {
    if (!id) return;
    try {
      const data = await projectService.getProjectDetails(id);
      setProject(data);
    } catch (error) {
      console.error("Erreur lors du chargement du projet", error);
      setError("Erreur lors du chargement du projet");
    }
  };

  const loadSubActivities = async () => {
    if (!id) return;
  
    const idNumber = Number(id);
  
    if (isNaN(idNumber)) {
      console.error("L'ID fourni n'est pas un nombre valide");
      return;
    }
  
    try {
      const data = await projectService.listSubActivities(idNumber);
      setSubActivities(data);
      setError(null);
    } catch (error) {
      console.error("Erreur lors du chargement des sous-activités:", error);
      setError("Erreur lors du chargement des sous-activités");
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateBudgetVariance = (budget: number, spent: number) => {
    const variance = budget - spent;
    return {
      value: variance,
      isPositive: variance >= 0
    };
  };

  const handleAddActivity = async (newActivity: Activity) => {
    if (!project) return;
    try {
      await projectService.addActivity(project.id, newActivity);
      await loadProject();
      setIsNewActivityModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'activité", error);
    }
  };

  const handleUpdateActivity = async (activityId: string, updatedActivity: Activity) => {
    if (!project) return;
    try {
      const updatedProject = {
        ...project,
        activites: project.activites.map(activity =>
          activity.id === activityId ? updatedActivity : activity
        )
      };
      await projectService.updateProject(project.id, updatedProject);
      await loadProject();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'activité", error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!project) return;
    try {
      const updatedProject = {
        ...project,
        activites: project.activites.filter(activity => activity.id !== activityId)
      };
      await projectService.updateProject(project.id, updatedProject);
      await loadProject();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'activité", error);
    }
  };

  const handleAddSubActivity = async (newSubActivity: SubActivity) => {
    if (!project) return;
    try {
      await projectService.addSubActivity(project.id, newSubActivity);
      await loadSubActivities();
      setIsNewSubActivityModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la sous-activité", error);
    }
  };

  const handleUpdateSubActivity = async (subActivityId: string, updatedSubActivity: SubActivity) => {
    if (!project) return;
    try {
      await projectService.updateSubActivity(subActivityId, updatedSubActivity);
      await loadSubActivities();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la sous-activité", error);
    }
  };

  const handleDeleteSubActivity = async (subActivityId: string) => {
    if (!project) return;
    try {
      await projectService.deleteSubActivity(subActivityId);
      await loadSubActivities();
    } catch (error) {
      console.error("Erreur lors de la suppression de la sous-activité", error);
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    setIsDeleting(true);
    try {
      await projectService.deleteProject(project.id);
      setIsDeleteProjectModalOpen(false);
      navigate('//projets'); // Redirection vers la liste des projets
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
      setError("Une erreur est survenue lors de la suppression du projet");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!project) {
    return <div>Chargement...</div>;
  }

  const budgetVariance = calculateBudgetVariance(
    project.budget.montantTotal || 0,
    project.budget.montantDepense || 0
  );

  return (
    <div className="space-y-8">
      {/* En-tête du projet */}
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
            {/* Budget */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Budget total</h3>
              <p className="text-2xl font-semibold mt-1">{formatBudget(project.budget.montantTotal || 0)}</p>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dépensé :</span>
                  <span className="font-medium">{formatBudget(project.budget.montantDepense || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Écart :</span>
                  <span className={`font-medium ${budgetVariance.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {formatBudget(budgetVariance.value)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progression :</span>
                    <span className={`font-medium ${project.budget.montantDepense > project.budget.montantTotal ? 'text-red-600' : 'text-blue-600'}`}>
                      {((project.budget.montantDepense || 0) / (project.budget.montantTotal || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${project.budget.montantDepense > project.budget.montantTotal ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ 
                        width: `${Math.min(
                          ((project.budget.montantDepense || 0) / (project.budget.montantTotal || 1)) * 100,
                          100
                        )}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Durée */}
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Durée</h3>
              <p className="text-xl font-semibold mt-1">
                {formatDate(project.created_at)} - {formatDate(project.updated_at)}
              </p>
            </div>

            {/* Responsable */}
            <div className="bg-yellow-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Responsable</h3>
              <p className="text-xl font-semibold mt-1">{project.managed_by || 'Aucun responsable assigné'}</p>
            </div>

            {/* Statut */}
            <div className="bg-red-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Statut</h3>
              <p className="text-xl font-semibold mt-1">{project.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activités */}
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
            activities={project.activites}
            onDelete={handleDeleteActivity}
            onUpdate={handleUpdateActivity}
          />
        </div>
      </div>

      {/* Sous-activités */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Sous-activités</h2>
            <button
              onClick={() => setIsNewSubActivityModalOpen(true)}
              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une sous-activité
            </button>
          </div>

          <ActivityList
            activities={project.subActivities}
            onDelete={handleDeleteSubActivity}
            onUpdate={handleUpdateSubActivity}
          />
        </div>
      </div>

      {/* Modals */}
      <NewActivityModal
        isOpen={isNewActivityModalOpen}
        onClose={() => setIsNewActivityModalOpen(false)}
        onSave={handleAddActivity}
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
    projectName={project?.name || ''}
    isLoading={isDeleting}
  />

      <NewSubActivityModal
        isOpen={isNewSubActivityModalOpen}
        onClose={() => setIsNewSubActivityModalOpen(false)}
        onSave={handleAddSubActivity}
      />
    </div>
  );
}

export default ProjectDetails;