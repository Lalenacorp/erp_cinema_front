import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';
import { activityService } from '../services/activityService';
import { projectService } from '../services/projectService';
import type { Expense, ExpenseUpdateResponse } from '../types/expense';
import type { Activity, SubActivity } from '../types/activity';
import type { Project } from '../types/project';
import { formatCurrency } from '../utils/formatters';
import { Calendar, Trash2, Edit2, Activity as ActivityIcon, Layers } from 'lucide-react';
import CurrencyIcon from './CurrencyIcon';
import toast from 'react-hot-toast';
import DeleteExpenseModal from './DeleteExpenseModal';
import { useWebSocket } from '../hooks/useWebSocket';

interface ExpenseListProps {
  projectId: string;
  onExpenseUpdate: (data: ExpenseUpdateResponse) => void;
  expenses: Expense[]; 
}

interface ExpenseWithDetails extends Expense {
  activityName?: string;
  subactivityName?: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ projectId, onExpenseUpdate }) => {
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

 
  const { deleteExpense, isConnected } = useWebSocket(projectId, async (data) => {
    try {
      // Mettre à jour les données du parent
      onExpenseUpdate(data);
      
      // Recharger immédiatement les dépenses
      const [expensesData, projectData] = await Promise.all([
        expenseService.listExpenses(projectId),
        projectService.getProjectDetails(projectId)
      ]);
      
      setExpenses(expensesData);
      setProject(projectData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des dépenses:', error);
      toast.error('Erreur lors de la mise à jour des dépenses');
    }
  });

  const handleDeleteExpense = async () => {
    if (!selectedExpense || !isConnected) return;

    setIsDeleting(true);
    try {
      const success = deleteExpense(selectedExpense.id);
      
      if (success) {
        await loadData();
        setIsDeleteModalOpen(false);
        toast.success('Dépense supprimée avec succès');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la dépense');
    } finally {
      setIsDeleting(false);
      setSelectedExpense(null);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);


  
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [expensesData, activitiesData, projectData] = await Promise.all([
        expenseService.listExpenses(projectId),
        activityService.listActivities(),
        projectService.getProjectDetails(projectId)
      ]);

      // Filtrer les activités pour ce projet
      const projectActivities = activitiesData.filter(
        activity => activity.project.toString() === projectId
      );
      setActivities(projectActivities);
      setProject(projectData);

      // Enrichir les dépenses avec les noms des activités et sous-activités
      const enrichedExpenses = expensesData.map(expense => {
        const subactivity = projectActivities
          .flatMap(a => a.activity_subactivity)
          .find(sa => sa.id === expense.subactivity);
        
        const activity = projectActivities.find(a => 
          a.activity_subactivity.some(sa => sa.id === expense.subactivity)
        );

        return {
          ...expense,
          activityName: activity?.name,
          subactivityName: subactivity?.name
        };
      });

      setExpenses(enrichedExpenses);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

  // Utiliser current_expenses du projet comme total des dépenses
  const totalExpenses = project?.current_expenses ? parseFloat(project.current_expenses) : 0;
  const budget = project?.budget ? parseFloat(project.budget) : 0;
  const budgetGap = budget - totalExpenses;
  const budgetUtilization = budget > 0 ? (totalExpenses / budget) * 100 : 0;

  // Grouper les dépenses par activité
  const expensesByActivity = expenses.reduce((acc, expense) => {
    const activityName = expense.activityName || 'Autre';
    if (!acc[activityName]) {
      acc[activityName] = [];
    }
    acc[activityName].push(expense);
    return acc;
  }, {} as Record<string, ExpenseWithDetails[]>);

  return (
    <div className="space-y-6">
      {/* Résumé des dépenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <CurrencyIcon 
                currency={project?.currency} 
                className="w-5 h-5 text-blue-600"
              />
            </div>
            <span className="text-sm font-medium text-blue-600">Total des dépenses</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(totalExpenses, project?.currency || 'EUR', project?.exchange_rate)}
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Budget</span>
              <span className="font-medium">
                {formatCurrency(budget, project?.currency || 'EUR', project?.exchange_rate)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Reste</span>
              <span className={`font-medium ${budgetGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(budgetGap), project?.currency || 'EUR', project?.exchange_rate)}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUtilization > 100 
                    ? 'bg-red-500' 
                    : budgetUtilization > 80 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {budgetUtilization.toFixed(1)}% utilisé
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <ActivityIcon className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">Budget Prévisionnel</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(budget, project?.currency || 'EUR', project?.exchange_rate)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">Ecart Budgétaire</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            <span className={`font-medium ${budgetGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(budgetGap, project?.currency || 'EUR', project?.exchange_rate)}
            </span>
          </p>
        </div>
      </div>

      {/* Liste des dépenses groupées par activité */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Activités</h2>
        {expenses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <CurrencyIcon 
              currency={project?.currency}
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune dépense enregistrée
            </h3>
            <p className="text-gray-600">
              Ajoutez votre première dépense en cliquant sur le bouton "Nouvelle dépense"
            </p>
          </div>
        ) : (
          <div className="space-y-6">
          {Object.entries(expensesByActivity).map(([activityName, activityExpenses]) => {
              const activityTotal = activityExpenses.reduce(
                (sum, exp) => sum + parseFloat(exp.amount),
                0
              );

              return (
                <div key={activityName} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <ActivityIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{activityName}</h3>
                          <p className="text-sm text-gray-500">
                            {activityExpenses.length} dépense{activityExpenses.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatCurrency(activityTotal, project?.currency || 'EUR', project?.exchange_rate)}
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {activityExpenses.map((expense) => (
                      <div 
                        key={expense.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="bg-blue-50 p-3 rounded-xl">
                                <CurrencyIcon 
                                  currency={project?.currency}
                                  className="w-6 h-6 text-blue-600"
                                />
                              </div>
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">
                                  {expense.name}
                                </h4>
                                <p className="text-2xl font-bold text-blue-600 mt-1">
                                  {formatCurrency(parseFloat(expense.amount), project?.currency || 'EUR', project?.exchange_rate)}
                                </p>
                                <div className="mt-2 space-y-1">
                                  {expense.subactivityName && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Layers className="w-4 h-4" />
                                      <span>Sous-activité : {expense.subactivityName}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {new Date(expense.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedExpense(expense);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer la dépense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedExpense && (
        <DeleteExpenseModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedExpense(null);
          }}
          onConfirm={handleDeleteExpense}
          expenseName={selectedExpense.name}
          amount={formatCurrency(parseFloat(selectedExpense.amount), project?.currency || 'EUR', project?.exchange_rate)}
          currency={project?.currency}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default ExpenseList;

export { ExpenseList }