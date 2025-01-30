import React, { useState, useEffect } from 'react';
import { Plus, FileText, Eye } from 'lucide-react';
import { projectService } from '../services/projectService';
import type { Project, Depense } from '../types';
import NewExpenseModal from '../components/NewExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';
import ExpenseDetailsModal from '../components/ExpenseDetailsModal';

function Depenses() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [expenses, setExpenses] = useState<Depense[]>([]);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Depense | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
      
      // Extraire toutes les dépenses des projets
      const allExpenses = data.flatMap(project => project.depenses);
      setExpenses(allExpenses);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    }
  };

  const handleAddExpense = async (newExpense: Omit<Depense, 'id'>) => {
    try {
      if (!selectedProjectId && !projects[0]?.id) return;
      const projectId = selectedProjectId || projects[0].id;
      
      await projectService.addExpense(projectId, newExpense);
      await loadProjects();
      setIsNewExpenseModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la dépense:', error);
    }
  };

  const handleEditExpense = async (expenseId: string, updatedExpense: Depense) => {
    try {
      const project = projects.find(p => p.depenses.some(d => d.id === expenseId));
      if (!project) return;

      await projectService.updateExpense(project.id, expenseId, updatedExpense);
      await loadProjects();
      setIsEditExpenseModalOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dépense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const project = projects.find(p => p.depenses.some(d => d.id === expenseId));
      if (!project) return;

      await projectService.deleteExpense(project.id, expenseId);
      await loadProjects();
      setSelectedExpense(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la dépense:', error);
    }
  };

  const handleViewExpense = (expense: Depense) => {
    setSelectedExpense(expense);
    setIsDetailsModalOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const filteredExpenses = selectedProjectId
    ? expenses.filter(expense => {
        const project = projects.find(p => p.id === selectedProjectId);
        return project?.depenses.some(d => d.id === expense.id);
      })
    : expenses;

  const selectedExpenseProject = selectedExpense
    ? projects.find(p => p.depenses.some(d => d.id === selectedExpense.id))
    : undefined;

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dépenses</h1>
            <p className="text-gray-600">Gérez les dépenses de vos projets</p>
          </div>
          <button
            onClick={() => setIsNewExpenseModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Dépense
          </button>
        </div>

        {/* Filtre par projet */}
        <div className="mb-6">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
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

      {/* Liste des dépenses */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Liste des dépenses</h2>
          <p className="text-gray-600 mt-1">Toutes les dépenses enregistrées</p>
        </div>

        <div className="divide-y">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{expense.description}</h3>
                    <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">{formatAmount(expense.montant)}</p>
                  <button
                    onClick={() => handleViewExpense(expense)}
                    className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredExpenses.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Aucune dépense trouvée
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <NewExpenseModal
        isOpen={isNewExpenseModalOpen}
        onClose={() => setIsNewExpenseModalOpen(false)}
        onSubmit={handleAddExpense}
        projects={projects}
        selectedProjectId={selectedProjectId}
      />

      {selectedExpense && (
        <>
          <EditExpenseModal
            isOpen={isEditExpenseModalOpen}
            onClose={() => {
              setIsEditExpenseModalOpen(false);
              setSelectedExpense(null);
            }}
            expense={selectedExpense}
            onSubmit={handleEditExpense}
          />

          <ExpenseDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedExpense(null);
            }}
            expense={selectedExpense}
            project={selectedExpenseProject}
            onEdit={() => {
              setIsDetailsModalOpen(false);
              setIsEditExpenseModalOpen(true);
            }}
            onDelete={() => {
              setIsDetailsModalOpen(false);
              handleDeleteExpense(selectedExpense.id);
            }}
          />
        </>
      )}
    </>
  );
}

export default Depenses;