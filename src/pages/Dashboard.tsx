import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, Film, Users } from 'lucide-react';
import { projectService } from '../services/projectService';
import type { Project } from '../types';

function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
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

  // Calcul des statistiques des projets
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.statut !== 'Terminé').length;
  const totalTeamMembers = projects.reduce((total, project) => 
    total + project.intervenants.length, 0
  );
  const upcomingDeadlines = projects.filter(p => {
    const daysUntilEnd = Math.ceil((p.dateFin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilEnd > 0 && daysUntilEnd <= 7;
  }).length;

  // Calcul du temps moyen par projet (en mois)
  const averageProjectDuration = projects.length > 0 
    ? projects.reduce((total, project) => {
        const duration = Math.ceil((project.dateFin.getTime() - project.dateDebut.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return total + duration;
      }, 0) / projects.length
    : 0;

  // Données pour le graphique Budget vs Dépenses
  const budgetData = projects.slice(0, 3).map(project => ({
    name: project.nom,
    budget: project.budget.montantTotal,
    depense: project.budget.montantDepense || 0
  }));

  // Données pour le graphique Statut des Projets
  const statusData = Object.entries(
    projects.reduce((acc, project) => {
      acc[project.statut] = (acc[project.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de vos projets cinématographiques</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Film className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Projets en cours</h3>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-semibold">{activeProjects}/{totalProjects}</p>
            {totalProjects > 0 && (
              <p className="text-sm font-medium">
                <span className="text-blue-600">{activeProjects}</span> en cours
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Membres de l'équipe</h3>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-semibold">{totalTeamMembers}</p>
            <p className="text-green-500 text-sm font-medium">Équipe totale</p>
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
            <p className="text-orange-500 text-sm font-medium">Cette semaine</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Temps moyen/projet</h3>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-semibold">{averageProjectDuration.toFixed(1)} mois</p>
            <p className="text-blue-500 text-sm font-medium">En moyenne</p>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique Budget vs Dépenses */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Budget vs Dépenses par Projet</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                <Bar dataKey="depense" fill="#10B981" name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique Statut des Projets */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Répartition des Projets par Statut</h3>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Activités Récentes</h3>
        <div className="space-y-4">
          {projects.slice(0, 3).map((project, index) => {
            const lastActivity = project.activites[project.activites.length - 1];
            const lastExpense = project.depenses[project.depenses.length - 1];
            
            let action = 'Mise à jour du projet';
            let montant = null;
            let date = project.dateDebut;

            if (lastExpense && lastActivity) {
              if (lastExpense.date > lastActivity.dateDebut!) {
                action = 'Nouvelle dépense ajoutée';
                montant = lastExpense.montant;
                date = lastExpense.date;
              } else {
                action = 'Nouvelle activité ajoutée';
                date = lastActivity.dateDebut!;
              }
            }

            return (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{project.nom}</p>
                  <p className="text-sm text-gray-500">{action}</p>
                </div>
                <div className="text-right">
                  {montant && (
                    <p className="font-medium text-green-600">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(montant)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {new Intl.DateTimeFormat('fr-FR', {
                      day: 'numeric',
                      month: 'long'
                    }).format(date)}
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