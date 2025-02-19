import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ExternalLink } from 'lucide-react';
import NewProjectModal from '../components/NewProjectModal';
import type { Project } from '../types';
import { projectService } from '../services/projectService';
import toast from 'react-hot-toast';

function Projets() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getProjects();
      // Trier les projets du plus récent au plus ancien
      const sortedData = data.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setProjects(sortedData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des projets';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Convert budget string to number for the API request
      const budgetNumber = parseFloat(projectData.budget);
      
      if (isNaN(budgetNumber)) {
        throw new Error('Le budget doit être un nombre valide');
      }

      await projectService.createProject({
        name: projectData.name,
        budget: budgetNumber, // Now passing a number instead of a string
        status: projectData.status || 'prepa',
        managed_by: projectData.managed_by
      });
      
      await loadProjects();
      setIsNewProjectModalOpen(false);
      toast.success('Projet créé avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du projet';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prepa':
        return 'bg-gray-100 text-gray-800';
      case 'pre-prod':
        return 'bg-blue-100 text-blue-800';
      case 'prod':
        return 'bg-green-100 text-green-800';
      case 'post-prod':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'prepa':
        return 'En préparation';
      case 'pre-prod':
        return 'Pré-production';
      case 'prod':
        return 'Production';
      case 'post-prod':
        return 'Post-production';
      default:
        return 'En préparation';
    }
  };

  const formatBudget = (budget: string | undefined) => {
    if (!budget) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(parseFloat(budget));
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const calculateBudgetVariance = (budget: string | undefined, currentExpenses: string | null) => {
    const budgetNum = budget ? parseFloat(budget) : 0;
    const expensesNum = currentExpenses ? parseFloat(currentExpenses) : 0;
    const variance = budgetNum - expensesNum;

    return {
      value: variance,
      isPositive: variance >= 0,
      formatted: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(Math.abs(variance)),
      percentage: budgetNum ? ((variance / budgetNum) * 100).toFixed(1) : '0'
    };
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Projets</h1>
            <p className="text-gray-600">Gérez vos projets cinématographiques</p>
          </div>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {filteredProjects.map((project) => {
            const budgetVariance = calculateBudgetVariance(project.budget, project.current_expenses);

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status || 'prepa')}`}>
                    {getStatusLabel(project.status || 'prepa')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Budget</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{formatBudget(project.budget)}</p>
                      <span className={`text-sm ${budgetVariance.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        ({budgetVariance.isPositive ? '+' : '-'} {budgetVariance.formatted})
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date de création</p>
                    <p className="font-semibold">
                      {formatDate(project.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Progression</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${(project.activites?.length || 0) > 0 ? 
                            (project.activites?.filter(a => a.status === 'Terminée').length || 0) / project.activites.length * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {(project.activites?.length || 0) > 0 ? 
                          Math.round((project.activites?.filter(a => a.status === 'Terminée').length || 0) / project.activites.length * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/projets/${project.id}`)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir les détails
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProjects.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun projet trouvé</p>
            </div>
          )}
        </div>
      </div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}

export default Projets;