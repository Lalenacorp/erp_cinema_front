import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';
import { activityService } from '../services/activityService';
import { projectService } from '../services/projectService';
import type { Expense, ExpenseUpdateResponse } from '../types/expense';
import type { Activity, SubActivity } from '../types/activity';
import type { Project } from '../types/project';
import { formatCurrency } from '../utils/formatters';
import { Calendar, Trash2, ChevronDown, ChevronRight, Activity as ActivityIcon, Layers, FileText } from 'lucide-react';
import CurrencyIcon from './CurrencyIcon';
import toast from 'react-hot-toast';
import DeleteExpenseModal from './DeleteExpenseModal';

interface ExpenseListProps {
  projectId: string;
  onExpenseUpdate: (data: ExpenseUpdateResponse) => void;
  expenses: Expense[];
}

interface ExpenseWithDetails extends Expense {
  activityName?: string;
  subactivityName?: string;
}

interface GroupedExpenses {
  [activityId: string]: {
    name: string;
    total: number;
    subactivities: {
      [subactivityId: string]: {
        name: string;
        expenses: ExpenseWithDetails[];
        total: number;
      };
    };
  };
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
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [expandedSubactivities, setExpandedSubactivities] = useState<Set<string>>(new Set());

  const toggleActivity = (activityId: string) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const toggleSubactivity = (subactivityId: string) => {
    setExpandedSubactivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subactivityId)) {
        newSet.delete(subactivityId);
      } else {
        newSet.add(subactivityId);
      }
      return newSet;
    });
  };

  const deleteExpense = async (expenseId: string | number) => {
    const token = localStorage.getItem('auth_token');
    const ws = new WebSocket(`ws://13.38.119.12/ws/project/${projectId}/?token=${token}`);
  
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        console.log('✅ WebSocket connecté pour suppression');
  
        const deleteRequest = {
          action: 'delete_expense',
          expense_id: expenseId.toString(),
        };
  
        ws.send(JSON.stringify(deleteRequest));
        console.log('🗑️ Requête de suppression envoyée :', deleteRequest);
      };
  
      ws.onmessage = async (event) => {
        const response = JSON.parse(event.data);
        console.log('📩 Réponse du serveur :', response);
        resolve(true);
      };
  
      ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket :', error);
        reject(error);
      };
  
      ws.onclose = () => {
        console.log('🔒 WebSocket fermé');
      };
    });
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
  
    setIsDeleting(true);
    try {
      const success = await deleteExpense(selectedExpense.id);
  
      if (success) {
        setExpenses((prevExpenses) => prevExpenses.filter(exp => exp.id !== selectedExpense.id));
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

      const projectActivities = activitiesData.filter(
        activity => activity.project.toString() === projectId
      );
      setActivities(projectActivities);
      setProject(projectData);

      const enrichedExpenses = expensesData.map(expense => {
        const activity = projectActivities.find(a => 
          a.activity_subactivity.some(sa => sa.id === expense.subactivity)
        );
        const subactivity = activity?.activity_subactivity.find(sa => sa.id === expense.subactivity);

        return {
          ...expense,
          activityId: activity?.id,
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

  const totalExpenses = project?.current_expenses ? parseFloat(project.current_expenses) : 0;
  const budget = project?.budget ? parseFloat(project.budget) : 0;
  const budgetGap = budget - totalExpenses;
  const budgetUtilization = budget > 0 ? (totalExpenses / budget) * 100 : 0;

  // Grouper les dépenses par activité et sous-activité
  const groupedExpenses = activities.reduce<GroupedExpenses>((acc, activity) => {
    if (!acc[activity.id]) {
      acc[activity.id] = {
        name: activity.name,
        total: 0,
        subactivities: {}
      };
    }

    activity.activity_subactivity.forEach(subactivity => {
      const subactivityExpenses = expenses.filter(e => e.subactivity === subactivity.id);
      const subactivityTotal = subactivityExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

      acc[activity.id].subactivities[subactivity.id] = {
        name: subactivity.name,
        expenses: subactivityExpenses,
        total: subactivityTotal
      };

      acc[activity.id].total += subactivityTotal;
    });

    return acc;
  }, {});

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

      {/* Liste des dépenses groupées */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Activités</h2>
        {Object.entries(groupedExpenses).length === 0 ? (
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
          <div className="space-y-4">
            {Object.entries(groupedExpenses).map(([activityId, activity]) => (
              <div key={activityId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* En-tête de l'activité */}
                <button
                  onClick={() => toggleActivity(activityId)}
                  className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ActivityIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">{activity.name}</h3>
                      <p className="text-sm text-gray-500">
                        {Object.keys(activity.subactivities).length} sous-activité(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-blue-600">
                      {formatCurrency(activity.total, project?.currency || 'EUR', project?.exchange_rate)}
                    </span>
                    {expandedActivities.has(activityId) ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Liste des sous-activités */}
                {expandedActivities.has(activityId) && (
                  <div className="divide-y divide-gray-100">
                    {Object.entries(activity.subactivities).map(([subactivityId, subactivity]) => (
                      <div key={subactivityId} className="bg-white border-l-4 border-blue-100 ml-4">
                        <button
                          onClick={() => toggleSubactivity(subactivityId)}
                          className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Layers className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-medium text-gray-800">{subactivity.name}</h4>
                              <p className="text-sm text-gray-500">
                                {subactivity.expenses.length} dépense(s)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-semibold text-gray-700">
                              {formatCurrency(subactivity.total, project?.currency || 'EUR', project?.exchange_rate)}
                            </span>
                            {expandedSubactivities.has(subactivityId) ? (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </button>

                        {/* Liste des dépenses */}
                        {expandedSubactivities.has(subactivityId) && (
                          <div className="bg-gray-50 divide-y divide-gray-100 border-l-4 border-gray-100 ml-8">
                            {subactivity.expenses.map((expense) => (
                              <div 
                                key={expense.id}
                                className="p-4 hover:bg-gray-100 transition-colors"
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
                                          {expense.proof_payment && (
                                            <div className="flex items-center gap-2 mt-2">
                                              <a
                                                href={expense.proof_payment}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                              >
                                                <FileText className="w-4 h-4" />
                                                Voir le justificatif
                                              </a>
                                            </div>
                                          )}
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
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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

export { ExpenseList };