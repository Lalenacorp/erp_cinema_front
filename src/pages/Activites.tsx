import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Users, Briefcase, AlertTriangle } from 'lucide-react';
import ActivityList from '../components/ActivityList';
import NewActivityModal from '../components/NewActivityModal';
import type { Activity, Project } from '../types';
import { projectService } from '../services/projectService';
import { activityService } from '../services/activityService';
import { useDebounce } from '../hooks/useDebonce';
import toast from 'react-hot-toast';

function Activites() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, activitiesData] = await Promise.all([
        projectService.getProjects(),
        activityService.listActivities()
      ]);
      
      setProjects(projectsData);
      setActivities(activitiesData);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivity = async (newActivity: Activity) => {
    try {
      await activityService.createActivity({
        project: parseInt(newActivity.project.toString()),
        name: newActivity.name,
        managed_by: newActivity.managed_by
      });
      
      await loadData();
      setIsNewActivityModalOpen(false);
      toast.success('Activité créée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
      toast.error('Erreur lors de la création de l\'activité');
    }
  };

  const handleUpdateActivity = async (activityId: number, updatedActivity: Activity) => {
    try {
      await activityService.updateActivity(activityId, {
        name: updatedActivity.name,
        description: updatedActivity.description
      });
      
      await loadData();
      toast.success('Activité mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
      toast.error('Erreur lors de la mise à jour de l\'activité');
    }
  };

  const handleDeleteActivity = async (activityId: number) => {
    try {
      await activityService.deleteActivity(activityId);
      await loadData();
      toast.success('Activité supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'activité:', error);
      toast.error('Erreur lors de la suppression de l\'activité');
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (activity.description || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesProject = !selectedProject || activity.project.toString() === selectedProject;
    return matchesSearch && matchesProject;
  });

  // Statistiques
  const totalActivities = filteredActivities.length;
  const completedActivities = filteredActivities.filter(a => a.status === 'Terminée').length;
  const inProgressActivities = filteredActivities.filter(a => a.status === 'En cours').length;
  const pendingActivities = filteredActivities.filter(a => a.status === 'En attente').length;

  return (
    <div className="space-y-8">
      {/* En-tête et statistiques */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Activités</h1>
            <p className="text-gray-600">
              {totalActivities} activité{totalActivities !== 1 ? 's' : ''} au total
            </p>
          </div>
          <button
            onClick={() => setIsNewActivityModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Activité
          </button>
        </div>

      {/*   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-semibold">{totalActivities}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-600">Terminées</span>
            </div>
            <p className="text-2xl font-semibold">{completedActivities}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-gray-600">En cours</span>
            </div>
            <p className="text-2xl font-semibold">{inProgressActivities}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-gray-600">En attente</span>
            </div>
            <p className="text-2xl font-semibold">{pendingActivities}</p>
          </div>
        </div> */}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une activité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les projets</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : filteredActivities.length > 0 ? (
            <ActivityList 
              activities={filteredActivities} 
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          ) : (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité trouvée</h3>
              <p className="text-gray-600">
                Modifiez vos filtres ou créez une nouvelle activité pour commencer
              </p>
            </div>
          )}
        </div>
      </div>

      <NewActivityModal
        isOpen={isNewActivityModalOpen}
        onClose={() => setIsNewActivityModalOpen(false)}
        onSubmit={handleAddActivity}
        projects={projects}
        selectedProjectId={selectedProject}
      />
    </div>
  );
}

export default Activites;