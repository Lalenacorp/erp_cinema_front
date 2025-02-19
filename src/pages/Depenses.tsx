import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { projectService } from '../services/projectService';
import { authService } from '../services/authService';
import type { Project } from '../types';
import type { ExpenseUpdateResponse, Expense } from '../types/expense';
import { ExpenseList } from '../components/ExpenseList';
import NewExpenseModal from '../components/NewExpenseModal';
import toast from 'react-hot-toast';

function Depenses() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const token = authService.getToken();
        if (!token || authService.isTokenExpired(token)) {
          const newTokens = await authService.refreshAccessToken();
          if (!newTokens) {
            throw new Error('Session expirée');
          }
        }
        await loadProjects();
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
        authService.logout();
      }
    };

    checkAuthAndLoadData();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des projets');
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseUpdate = (data: ExpenseUpdateResponse) => {
    console.log('Mise à jour des dépenses:', data);
    loadProjects(); 
  };

  // Trier les dépenses par `created_at` (du plus récent au plus ancien)
  const sortedExpenses = expenses.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Dépenses</h1>
          <p className="text-gray-600">Gérez les dépenses de vos projets</p>
        </div>
        <button
          onClick={() => setIsNewExpenseModalOpen(true)}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
          title={'Ajouter une dépense'}
        >
          <Plus className="w-5 h-5" />
          Nouvelle dépense
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionnez un projet</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {selectedProject ? (
            <ExpenseList
              projectId={selectedProject}
              onExpenseUpdate={handleExpenseUpdate}
              expenses={sortedExpenses}  
            />
          ) : (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionnez un projet
              </h3>
              <p className="text-gray-600">
                Choisissez un projet pour voir et gérer ses dépenses
              </p>
            </div>
          )}
        </div>
      </div>

      <NewExpenseModal
        isOpen={isNewExpenseModalOpen}
        onClose={() => setIsNewExpenseModalOpen(false)}
        projects={projects}
        onExpenseUpdate={handleExpenseUpdate}
      />
    </div>
  );
}

export default Depenses;
