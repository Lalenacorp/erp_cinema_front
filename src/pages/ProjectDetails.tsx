import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import type { Project, Activite } from '../types';
import ActivityList from '../components/ActivityList';
import NewActivityModal from '../components/NewActivityModal';
import EditProjectModal from '../components/EditProjectModal';
import DeleteProjectModal from '../components/DeleteProjectModal';

function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    if (!id) return;
    const data = await projectService.getProjectById(id);
    setProject(data);
  };

  const formatDate = (date: Date) => {
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

  const handleAddActivity = async (newActivity: Activite) => {
    if (!project) return;
    await projectService.addActivity(project.id, newActivity);
    await loadProject();
    setIsNewActivityModalOpen(false);
  };

  const handleUpdateActivity = async (activityId: string, updatedActivity: Activite) => {
    if (!project) return;
    const updatedProject = {
      ...project,
      activites: project.activites.map(activity =>
        activity.id === activityId ? updatedActivity : activity
      )
    };
    await projectService.updateProject(project.id, updatedProject);
    await loadProject();
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!project) return;
    const updatedProject = {
      ...project,
      activites: project.activites.filter(activity => activity.id !== activityId)
    };
    await projectService.updateProject(project.id, updatedProject);
    await loadProject();
  };

  if (!project) {
    return <div>Chargement...</div>;
  }

  const budgetVariance = calculateBudgetVariance(
    project.budget.montantTotal,
    project.budget.montantDepense || 0
  );

  return (
    <div className="space-y-8">
      {/* En-tête du projet */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{project.nom}</h1>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditProjectModalOpen(true)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => setIsDeleteProjectModalOpen(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center gap-2"
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
                    <span className={`font-medium ${
                      project.budget.montantDepense > project.budget.montantTotal 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                    }`}>
                      {((project.budget.montantDepense / project.budget.montantTotal) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.budget.montantDepense > project.budget.montantTotal 
                          ? 'bg-red-500' 
                          : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min(
                          (project.budget.montantDepense / project.budget.montantTotal) * 100,
                          100
                        )}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Période</h3>
              <p className="text-lg font-semibold mt-1">
                {formatDate(project.dateDebut)} - {formatDate(project.dateFin)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {Math.ceil((project.dateFin.getTime() - project.dateDebut.getTime()) / (1000 * 60 * 60 * 24))} jours
              </p>
            </div>

            {/* Statut */}
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Statut</h3>
              <p className="text-lg font-semibold mt-1">{project.statut}</p>
            </div>

            {/* Équipe */}
            <div className="bg-orange-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Équipe</h3>
              <p className="text-lg font-semibold mt-1">{project.intervenants.length} membres</p>
              <p className="text-sm text-gray-600 mt-2">
                {project.intervenants.slice(0, 2).map(i => i.nom).join(', ')}
                {project.intervenants.length > 2 && ` et ${project.intervenants.length - 2} autres`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des activités */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Activités</h2>
            <p className="text-gray-600 mt-1">Liste des activités du projet</p>
          </div>
          <button
            onClick={() => setIsNewActivityModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Activité
          </button>
        </div>

        <ActivityList 
          activities={project.activites}
          onUpdateActivity={handleUpdateActivity}
          onDeleteActivity={handleDeleteActivity}
        />
      </div>

      {/* Modales */}
      <NewActivityModal
        isOpen={isNewActivityModalOpen}
        onClose={() => setIsNewActivityModalOpen(false)}
        onSubmit={handleAddActivity}
        intervenants={project.intervenants}
        projects={[project]}
        selectedProjectId={project.id}
      />

      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        project={project}
        onSubmit={async (updatedProject) => {
          await projectService.updateProject(project.id, updatedProject);
          await loadProject();
          setIsEditProjectModalOpen(false);
        }}
      />

      <DeleteProjectModal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => setIsDeleteProjectModalOpen(false)}
        projectName={project.nom}
        onConfirm={async () => {
          await projectService.deleteProject(project.id);
          window.location.href = '/projets';
        }}
      />
    </div>
  );
}

export default ProjectDetails;