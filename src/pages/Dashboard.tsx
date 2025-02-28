import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Clock, Film, Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { projectService } from '../services/projectService';
import { authService } from '../services/authService';
import type { Project } from '../types';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';
import toast from 'react-hot-toast';
import ServerError from './ServerError';

function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [projectsData, userData] = await Promise.all([
        projectService.getProjects(),
        authService.getCurrentUser()
      ]);
      
      setProjects(projectsData);
      setCurrentUser(userData);
      setError(null);
    } catch (err: any) {
      if (err instanceof ServerError) {
        throw err; // L'ErrorBoundary interceptera cette erreur
      }
      setError(err.message || 'Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculs des statistiques globales
  const totalProjects = projects.length;
  const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget), 0);
  const totalExpenses = projects.reduce((sum, p) => sum + (p.current_expenses ? parseFloat(p.current_expenses) : 0), 0);
  const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // Calcul des projets avec échéances proches (7 jours)
  const today = new Date();
  const upcomingProjects = projects.filter(project => {
    if (!project.started_at || !project.achieved_at) return false;

    const startDate = new Date(project.started_at);
    const endDate = new Date(project.achieved_at);
    const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Projet qui commence ou se termine dans les 7 prochains jours
    return (daysUntilStart >= 0 && daysUntilStart <= 7) || (daysUntilEnd >= 0 && daysUntilEnd <= 7);
  });

  const upcomingDeadlines = upcomingProjects.length;

  // Détails des échéances
  const upcomingDetails = upcomingProjects.map(project => {
    const startDate = new Date(project.started_at);
    const endDate = new Date(project.achieved_at);
    const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      name: project.name,
      isStarting: daysUntilStart >= 0 && daysUntilStart <= 7,
      isEnding: daysUntilEnd >= 0 && daysUntilEnd <= 7,
      daysUntilStart,
      daysUntilEnd
    };
  });

  // Calcul de la durée moyenne des projets (en mois)
  const averageProjectDuration = projects.length > 0 
    ? projects.reduce((total, project) => {
        if (!project.started_at || !project.achieved_at) return total;
        const duration = Math.ceil(
          (new Date(project.achieved_at).getTime() - new Date(project.started_at).getTime()) 
          / (1000 * 60 * 60 * 24 * 30)
        );
        return total + duration;
      }, 0) / projects.length
    : 0;

  // Données pour le graphique Budget vs Dépenses
  const budgetData = projects.slice(0, 5).map(project => ({
    name: project.name,
    budget: parseFloat(project.budget),
    depenses: project.current_expenses ? parseFloat(project.current_expenses) : 0,
    ecart: parseFloat(project.budget) - (project.current_expenses ? parseFloat(project.current_expenses) : 0)
  }));

  // Données pour le graphique Statut des Projets
  const statusData = Object.entries(
    projects.reduce((acc, project) => {
      const status = project.status || 'prepa';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ 
    name: getStatusLabel(name), 
    value 
  }));

  // Données pour le graphique d'évolution des dépenses
  const expensesTrend = projects.map(project => ({
    name: project.name,
    montant: project.current_expenses ? parseFloat(project.current_expenses) : 0,
    date: new Date(project.created_at).getTime()
  })).sort((a, b) => a.date - b.date);

  const COLORS = {
    status: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
    budget: {
      total: '#3B82F6',
      depenses: '#10B981',
      ecart: '#EF4444'
    }
  };

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'prepa': return 'En préparation';
      case 'pre-prod': return 'Pré-production';
      case 'prod': return 'Production';
      case 'post-prod': return 'Post-production';
      default: return status;
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de vos projets cinématographiques</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Film className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total des projets</h3>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-semibold">{totalProjects}</p>
            <p className="text-sm font-medium text-blue-600">
              Tous les projets
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Budget total</h3>
          <div className="flex flex-col mt-1">
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
              <p className="text-sm font-medium">
                <span className={budgetUtilization > 90 ? 'text-red-600' : 'text-green-600'}>
                  {formatPercentage(budgetUtilization)} utilisé
                </span>
              </p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-500">Dépensé :</p>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Échéances proches</h3>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-semibold">{upcomingDeadlines}</p>
            <p className="text-purple-600 text-sm font-medium">
              Dans les 7 jours
            </p>
          </div>
          {upcomingDeadlines > 0 && (
            <div className="mt-2 space-y-1">
              {upcomingDetails.map((project, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {project.name} - {project.isStarting 
                    ? `Début dans ${project.daysUntilStart}j` 
                    : `Fin dans ${project.daysUntilEnd}j`}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Activités en cours</h3>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-semibold">
              {projects.reduce((sum, p) => sum + (p.activites?.length || 0), 0)}
            </p>
            <p className="text-orange-600 text-sm font-medium">Total</p>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Dépenses */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Budget vs Dépenses par Projet</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="budget" fill={COLORS.budget.total} name="Budget" />
                <Bar dataKey="depenses" fill={COLORS.budget.depenses} name="Dépenses" />
                <Bar dataKey="ecart" fill={COLORS.budget.ecart} name="Écart" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statut des Projets */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Répartition par Statut</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.status[index % COLORS.status.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Évolution des dépenses */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Évolution des Dépenses</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={expensesTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(timestamp) => formatDate(new Date(timestamp).toISOString())}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(timestamp) => formatDate(new Date(timestamp).toISOString())}
              />
              <Line 
                type="monotone" 
                dataKey="montant" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Activités Récentes</h3>
        <div className="space-y-4">
          {projects.slice(0, 5).map((project) => {
            const lastActivity = project.activites?.[project.activites.length - 1];
            const budget = parseFloat(project.budget);
            const expenses = project.current_expenses ? parseFloat(project.current_expenses) : 0;
            const progress = (expenses / budget) * 100;
            
            return (
              <div key={project.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-gray-500">
                    {lastActivity ? lastActivity.name : getStatusLabel(project.status || 'prepa')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          progress > 90 ? 'bg-red-500' : 
                          progress > 70 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(project.updated_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;