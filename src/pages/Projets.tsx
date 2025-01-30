import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ExternalLink } from 'lucide-react';
import NewProjectModal from '../components/NewProjectModal';
import type { Project } from '../types';
import { projectService } from '../services/projectService';

function Projets() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Charger les projets au montage du composant
  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    }
  };

  const handleCreateProject = async (project: Omit<Project, 'id'>) => {
    try {
      await projectService.createProject(project);
      await loadProjects();
      setIsNewProjectModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En préparation':
        return 'bg-gray-100 text-gray-800';
      case 'Pré-production':
        return 'bg-blue-100 text-blue-800';
      case 'Production':
        return 'bg-green-100 text-green-800';
      case 'Post-production':
        return 'bg-purple-100 text-purple-800';
      case 'Distribution':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const calculateBudgetVariance = (budget: number, spent: number) => {
    const variance = budget - spent;
    return {
      value: variance,
      isPositive: variance >= 0,
      formatted: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(Math.abs(variance)),
      percentage: budget ? ((variance / budget) * 100).toFixed(1) : '0'
    };
  };

  const filteredProjects = projects.filter(project =>
    project.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Projets</h1>
            <p className="text-gray-600">Gérez vos projets cinématographiques</p>
          </div>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau Projet
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredProjects.map((project) => {
            const totalSpent = project.depenses.reduce((sum, depense) => sum + depense.montant, 0);
            const budgetVariance = calculateBudgetVariance(project.budget.montantTotal || 0, totalSpent);

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{project.nom}</h2>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.statut)}`}>
                    {project.statut}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Budget</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{formatBudget(project.budget.montantTotal || 0)}</p>
                      <span className={`text-sm ${budgetVariance.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        ({budgetVariance.isPositive ? '+' : '-'} {budgetVariance.formatted})
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Période</p>
                    <p className="font-semibold">
                      {formatDate(project.dateDebut)} - {formatDate(project.dateFin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Progression</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${project.activites?.length ? (project.activites.filter(a => a.statut === 'Terminée').length / project.activites.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {project.activites?.length ? Math.round((project.activites.filter(a => a.statut === 'Terminée').length / project.activites.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/projets/${project.id}`)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir les détails
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </>
  );
}

export default Projets;