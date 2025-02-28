import React, { useState, useEffect } from 'react';
import { ArrowDownUp, DollarSign, FileBarChart, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { apiService } from '../services/apiService';
import { gapReportService } from '../services/gapReportService';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import { Expense } from '../types/expense';
import { GapSummary } from '../types/gapReport';
import { Activity } from '../types/activity';
import { SubActivity } from '../types/activity';

function ExpenseReport() {
  const [projects, setProjects] = useState<{ id: string | number; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gaps, setGaps] = useState<GapSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubactivities, setExpandedSubactivities] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadProjects();
    loadActivities();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getProjects();
      setProjects(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des projets');
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.listActivities();
      setActivities(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des activités');
      toast.error('Erreur lors du chargement des activités');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExpenses = async (projectId: string | number) => {
    try {
      setIsLoading(true);
      const data = await expenseService.listExpenses(projectId.toString());
      setExpenses(data);
    } catch (error) {
      console.error('Erreur chargement dépenses:', error);
      toast.error('Erreur lors du chargement des dépenses');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGapsForProject = async (projectId: string | number) => {
    try {
      setIsLoading(true);
      const data = await gapReportService.getProjectGapSummary(projectId);
      setGaps(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des écarts pour le projet:', error);
      toast.error('Erreur lors du chargement des écarts budgétaires');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = event.target.value;
    setSelectedProject(projectId);
    setExpandedSubactivities({});
    
    if (projectId) {
      loadExpenses(projectId);
      loadGapsForProject(projectId);
    } else {
      setExpenses([]);
      setGaps([]);
    }
  };

  const toggleSubactivity = (subactivityId: string) => {
    setExpandedSubactivities(prev => ({
      ...prev,
      [subactivityId]: !prev[subactivityId]
    }));
  };

 

  // Obtenir le nom de l'activité à partir de l'ID de sous-activité
// Function to get activity name (move it above the usage)
const getActivityName = (subactivityId: number) => {
  const activity = activities.find((activity) =>
    activity.activity_subactivity.some((subactivity: SubActivity) => subactivity.id === subactivityId)
  );
  return activity ? activity.name : 'Activité inconnue';
};

// Grouper les dépenses par activité puis par sous-activité



  // Obtenir le nom de la sous-activité à partir de l'ID
// Function to get subactivity name (move it above the usage)
const getSubactivityName = (subactivityId: number) => {
  let subactivityName = 'Sous-activité inconnue';

  activities.forEach(activity => {
    const subactivity = activity.activity_subactivity.find(
      (sub: SubActivity) => sub.id === subactivityId
    );
    if (subactivity) {
      subactivityName = subactivity.name;
    }
  });

  return subactivityName;
};

// Grouper les dépenses par activité puis par sous-activité
const groupedByActivity = expenses.reduce((acc, expense) => {
  const subactivityId = expense.subactivity.toString();
  const activityName = getActivityName(Number(subactivityId));

  if (!acc[activityName]) {
    acc[activityName] = {};
  }

  if (!acc[activityName][subactivityId]) {
    acc[activityName][subactivityId] = { total: 0, expenses: [], name: getSubactivityName(Number(subactivityId)) };
  }

  acc[activityName][subactivityId].total += parseFloat(expense.amount);
  acc[activityName][subactivityId].expenses.push(expense);

  return acc;
}, {} as Record<string, Record<string, { total: number; expenses: Expense[]; name: string }>>);


  // Obtenir l'écart budgétaire pour une sous-activité spécifique
  const getGapForSubactivity = (subactivityId: number) => {
    const gap = gaps.find(gap => gap.subactivity === subactivityId);
    return gap ? parseFloat(gap.gap) : 0;
  };

  // Calculer les totaux par activité
  const calculateActivityTotals = () => {
    const activityTotals: Record<string, { expenses: number; gaps: number }> = {};
    
    // Calculer les totaux des dépenses par activité
    Object.entries(groupedByActivity).forEach(([activityName, subactivities]) => {
      if (!activityTotals[activityName]) {
        activityTotals[activityName] = { expenses: 0, gaps: 0 };
      }
      
      Object.entries(subactivities).forEach(([subactivityId, { total }]) => {
        activityTotals[activityName].expenses += total;
        
        // Ajouter l'écart budgétaire pour cette sous-activité
        const numericSubactivityId = Number(subactivityId);
        const gapAmount = getGapForSubactivity(numericSubactivityId);
        activityTotals[activityName].gaps += gapAmount;
      });
    });
    
    return activityTotals;
  };

  // Calculer les totaux globaux
  const calculateTotals = () => {
    const totalExpenses = Object.values(groupedByActivity).reduce((sum, subactivities) => {
      return sum + Object.values(subactivities).reduce((subSum, { total }) => subSum + total, 0);
    }, 0);
    
    const totalGap = gaps.reduce((sum, gap) => sum + parseFloat(gap.gap), 0);
    
    return { totalExpenses, totalGap };
  };

  const activityTotals = calculateActivityTotals();
  const { totalExpenses, totalGap } = calculateTotals();

  // Déterminer la classe de couleur en fonction de l'écart
  const getGapColorClass = (gapAmount: number) => {
    if (gapAmount < 0) return 'text-red-600';
    if (gapAmount > 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getSelectedProjectName = () => {
    if (!selectedProject) return '';
    const project = projects.find(p => p.id.toString() === selectedProject);
    return project ? project.name : '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Rapport Financier</h1>
        <p className="text-gray-600">Analyse des dépenses et écarts budgétaires par activité</p>
      </div>
      
      <div className="mb-8 bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <FileBarChart className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Sélection du projet</h2>
        </div>
        
        <select
          value={selectedProject || ''}
          onChange={handleProjectChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
        >
          <option value="">-- Choisissez un projet --</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      ) : selectedProject ? (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Projet</p>
                  <h3 className="text-xl font-bold text-gray-800">{getSelectedProjectName()}</h3>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <FileBarChart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total des dépenses</p>
                  <h3 className="text-xl font-bold text-gray-800">{formatCurrency(totalExpenses, 'EUR')}</h3>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Écart budgétaire</p>
                  <h3 className={`text-xl font-bold ${getGapColorClass(totalGap)}`}>
                    {formatCurrency(totalGap, 'EUR')}
                  </h3>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <ArrowDownUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
              <div className="flex items-center">
                <FileBarChart className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-blue-800">Détail des dépenses et écarts budgétaires</h2>
              </div>
            </div>
            
            {Object.keys(groupedByActivity).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 text-left font-semibold text-gray-700">Activité / Sous-activité</th>
                      <th className="p-4 text-right font-semibold text-gray-700">Dépenses (EUR)</th>
                      <th className="p-4 text-right font-semibold text-gray-700">Écart Budgétaire</th>
                      <th className="p-4 text-center font-semibold text-gray-700">Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedByActivity).map(([activityName, subactivities], activityIndex) => {
                      const activityTotal = activityTotals[activityName];
                      
                      return (
                        <React.Fragment key={activityIndex}>
                          {/* En-tête de l'activité */}
                          <tr className="bg-gray-100 font-medium border-b border-gray-200">
                            <td className="p-4 text-gray-800 font-bold">
                              {activityName}
                            </td>
                            <td className="p-4 text-right text-gray-800 font-bold">
                              {formatCurrency(activityTotal.expenses, 'EUR')}
                            </td>
                            <td className="p-4 text-right font-bold">
                              <span className={getGapColorClass(activityTotal.gaps)}>
                                {formatCurrency(activityTotal.gaps, 'EUR')}
                              </span>
                            </td>
                            <td className="p-4"></td>
                          </tr>
                          
                          {/* Sous-activités */}
                          {Object.entries(subactivities).map(([subactivityId, { total, expenses, name }]) => {
                            const numericSubactivityId = Number(subactivityId);
                            const gapAmount = getGapForSubactivity(numericSubactivityId);
                            const isExpanded = expandedSubactivities[subactivityId] || false;
                            
                            return (
                              <React.Fragment key={subactivityId}>
                                {/* Ligne de la sous-activité */}
                                <tr className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="p-4 pl-8 font-medium text-gray-700">{name}</td>
                                  <td className="p-4 text-right font-medium text-gray-700">{formatCurrency(total, 'EUR')}</td>
                                  <td className="p-4 text-right">
                                    <span className={`font-medium ${getGapColorClass(gapAmount)}`}>
                                      {formatCurrency(gapAmount, 'EUR')}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <button 
                                      onClick={() => toggleSubactivity(subactivityId)}
                                      className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-5 w-5 text-gray-600" />
                                      ) : (
                                        <ChevronRight className="h-5 w-5 text-gray-600" />
                                      )}
                                    </button>
                                  </td>
                                </tr>
                                
                                {/* Détails des dépenses si la sous-activité est développée */}
                                {isExpanded && expenses.map((expense) => (
                                  <tr key={expense.id} className="bg-gray-50 border-b border-gray-200 text-sm">
                                    <td className="p-3 pl-12 text-gray-600">
                                      {expense.name || 'Dépense sans nom'}
                                    </td>
                                    <td className="p-3 text-right text-gray-600">
                                      {formatCurrency(parseFloat(expense.amount), 'EUR')}
                                    </td>
                                    <td className="p-3"></td>
                                    <td className="p-3"></td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                      <td className="p-4 text-gray-800">Total</td>
                      <td className="p-4 text-right text-gray-800">
                        {formatCurrency(totalExpenses, 'EUR')}
                      </td>
                      <td className="p-4 text-right">
                        <span className={getGapColorClass(totalGap)}>
                          {formatCurrency(totalGap, 'EUR')}
                        </span>
                      </td>
                      <td className="p-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucune dépense trouvée pour ce projet.</p>
                <p className="text-sm text-gray-400">Veuillez vérifier que des dépenses ont été enregistrées pour ce projet.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-blue-50 p-8 rounded-xl text-center shadow-md">
          <FileBarChart className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-blue-800 mb-2">Rapport financier</h3>
          <p className="text-blue-600 mb-4">Veuillez sélectionner un projet pour afficher les dépenses et écarts budgétaires.</p>
        </div>
      )}
    </div>
  );
}

export default ExpenseReport;