import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ActivityList from '../components/ActivityList';
import NewActivityModal from '../components/NewActivityModal';
import type { Activite, Intervenant, Project } from '../types';
import { projectService } from '../services/projectService';

// Données d'exemple pour les intervenants
const sampleIntervenants: Intervenant[] = [
  {
    id: '1',
    nom: "Jean Dupont",
    role: "Réalisateur",
    sousActivites: []
  },
  {
    id: '2',
    nom: "Marie Martin",
    role: "Directrice de production",
    sousActivites: []
  },
  {
    id: '3',
    nom: "Pierre Durand",
    role: "Directeur de la photographie",
    sousActivites: []
  },
  {
    id: '4',
    nom: "Sophie Bernard",
    role: "Directrice de casting",
    sousActivites: []
  }
];

function Activites() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [activities, setActivities] = useState<Activite[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);

  // Charger les projets et leurs activités
  useEffect(() => {
    const loadProjects = async () => {
      const allProjects = await projectService.getProjects();
      setProjects(allProjects);
      
      // Extraire toutes les activités des projets
      const allActivities = allProjects.flatMap(project => project.activites);
      setActivities(allActivities);
    };
    
    loadProjects();
  }, []);

  const handleAddActivity = async (newActivity: Activite) => {
    try {
      // Ajouter l'activité au projet via le service
      await projectService.addActivity(newActivity.projetId, newActivity);
      
      // Recharger les projets pour avoir les données à jour
      const updatedProjects = await projectService.getProjects();
      setProjects(updatedProjects);
      
      // Mettre à jour la liste des activités
      const updatedActivities = updatedProjects.flatMap(project => project.activites);
      setActivities(updatedActivities);
      
      setIsNewActivityModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
    }
  };

  const handleUpdateActivity = async (activityId: string, updatedActivity: Activite) => {
    try {
      // Trouver le projet qui contient l'activité
      const project = projects.find(p => 
        p.activites.some(a => a.id === activityId)
      );
      
      if (!project) return;

      // Mettre à jour l'activité dans le projet
      const updatedActivities = project.activites.map(activity =>
        activity.id === activityId ? updatedActivity : activity
      );

      const updatedProject = {
        ...project,
        activites: updatedActivities
      };

      // Mettre à jour le projet via le service
      await projectService.updateProject(project.id, updatedProject);
      
      // Recharger les projets pour avoir les données à jour
      const refreshedProjects = await projectService.getProjects();
      setProjects(refreshedProjects);
      
      // Mettre à jour la liste des activités
      const refreshedActivities = refreshedProjects.flatMap(p => p.activites);
      setActivities(refreshedActivities);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      // Trouver le projet qui contient l'activité
      const project = projects.find(p => 
        p.activites.some(a => a.id === activityId)
      );
      
      if (!project) return;

      // Filtrer l'activité supprimée
      const updatedActivities = project.activites.filter(activity => 
        activity.id !== activityId
      );

      const updatedProject = {
        ...project,
        activites: updatedActivities
      };

      // Mettre à jour le projet via le service
      await projectService.updateProject(project.id, updatedProject);
      
      // Recharger les projets pour avoir les données à jour
      const refreshedProjects = await projectService.getProjects();
      setProjects(refreshedProjects);
      
      // Mettre à jour la liste des activités
      const refreshedActivities = refreshedProjects.flatMap(p => p.activites);
      setActivities(refreshedActivities);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'activité:', error);
    }
  };

  const filteredActivities = selectedProject
    ? activities.filter(activity => activity.projetId === selectedProject)
    : activities;

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Activités</h1>
            <p className="text-gray-600">Gérez et suivez toutes les activités des projets</p>
          </div>
          <button
            onClick={() => setIsNewActivityModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Activité
          </button>
        </div>

        {/* Filtre par projet */}
        <div className="mb-6">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les projets</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ActivityList 
        activities={filteredActivities} 
        onUpdateActivity={handleUpdateActivity}
        onDeleteActivity={handleDeleteActivity}
      />

      <NewActivityModal
        isOpen={isNewActivityModalOpen}
        onClose={() => setIsNewActivityModalOpen(false)}
        onSubmit={handleAddActivity}
        intervenants={sampleIntervenants}
        projects={projects}
        selectedProjectId={selectedProject}
      />
    </>
  );
}

export default Activites;