import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Activite, SousActivite } from '../types';
import NewSubActivityModal from './NewSubActivityModal';
import EditSubActivityModal from './EditSubActivityModal';
import EditActivityModal from './EditActivityModal';

interface ActivityListProps {
  activities: Activite[];
  onUpdateActivity?: (activityId: string, updatedActivity: Activite) => void;
  onDeleteActivity?: (activityId: string) => void;
}

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

const ActivityList: React.FC<ActivityListProps> = ({ 
  activities, 
  onUpdateActivity,
  onDeleteActivity
}) => {
  const [expandedActivities, setExpandedActivities] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activite | null>(null);
  const [selectedSubActivity, setSelectedSubActivity] = useState<SousActivite | null>(null);
  const [isNewSubActivityModalOpen, setIsNewSubActivityModalOpen] = useState(false);
  const [isEditSubActivityModalOpen, setIsEditSubActivityModalOpen] = useState(false);
  const [isEditActivityModalOpen, setIsEditActivityModalOpen] = useState(false);

  const toggleActivity = (activityName: string) => {
    setExpandedActivities(prev =>
      prev.includes(activityName)
        ? prev.filter(name => name !== activityName)
        : [...prev, activityName]
    );
  };

  const handleAddSubActivity = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setSelectedActivity(activity);
      setIsNewSubActivityModalOpen(true);
    }
  };

  const handleEditActivity = (activity: Activite) => {
    setSelectedActivity(activity);
    setIsEditActivityModalOpen(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (onDeleteActivity) {
      onDeleteActivity(activityId);
    }
  };

  const handleEditSubActivity = (activity: Activite, subActivity: SousActivite) => {
    setSelectedActivity(activity);
    setSelectedSubActivity(subActivity);
    setIsEditSubActivityModalOpen(true);
  };

  const handleDeleteSubActivity = (activity: Activite, subActivityId: string) => {
    if (!onUpdateActivity) return;

    const updatedActivity = {
      ...activity,
      sousActivites: activity.sousActivites.filter(sa => sa.id !== subActivityId),
      montantTotal: activity.montantTotal - activity.sousActivites.find(sa => sa.id === subActivityId)?.montantPrevu!
    };

    onUpdateActivity(activity.id, updatedActivity);
  };

  const handleSubActivityUpdate = (activity: Activite, updatedSubActivity: SousActivite) => {
    if (!onUpdateActivity) return;

    const updatedActivity = {
      ...activity,
      sousActivites: activity.sousActivites.map(sa => 
        sa.id === updatedSubActivity.id ? updatedSubActivity : sa
      ),
      montantTotal: activity.montantTotal - 
        activity.sousActivites.find(sa => sa.id === updatedSubActivity.id)?.montantPrevu! +
        updatedSubActivity.montantPrevu
    };

    onUpdateActivity(activity.id, updatedActivity);
    setIsEditSubActivityModalOpen(false);
  };

  const handleNewSubActivity = (activity: Activite, newSubActivity: SousActivite) => {
    if (!onUpdateActivity) return;

    const updatedActivity = {
      ...activity,
      sousActivites: [...activity.sousActivites, newSubActivity],
      montantTotal: activity.montantTotal + newSubActivity.montantPrevu
    };

    onUpdateActivity(activity.id, updatedActivity);
    setIsNewSubActivityModalOpen(false);
  };

  const handleActivityUpdate = (updatedActivity: Activite) => {
    if (!onUpdateActivity) return;
    onUpdateActivity(updatedActivity.id, updatedActivity);
    setIsEditActivityModalOpen(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Activités en cours</h2>
        <button className="text-blue-500 text-sm font-medium">Voir tout</button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const activitySpent = activity.sousActivites.reduce(
            (total, sa) => total + (sa.montantDepense || 0),
            0
          );
          const activityVariance = calculateBudgetVariance(activity.montantTotal, activitySpent);

          return (
            <div key={activity.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => toggleActivity(activity.nom)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{activity.nom}</h3>
                      <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                      {activity.createdBy && activity.createdAt && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <span>Créé par {activity.createdBy.username}</span>
                          <span>•</span>
                          <span>{formatDate(activity.createdAt)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(activity.montantTotal)}</p>
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className={`text-sm ${activityVariance.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {activityVariance.isPositive ? '+' : '-'} {activityVariance.formatted}
                        </p>
                      </div>
                      {expandedActivities.includes(activity.nom) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditActivity(activity)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {expandedActivities.includes(activity.nom) && (
                <div className="border-t bg-gray-50">
                  {activity.sousActivites.map((sousActivite) => {
                    const subActivityVariance = calculateBudgetVariance(
                      sousActivite.montantPrevu,
                      sousActivite.montantDepense || 0
                    );

                    return (
                      <div
                        key={sousActivite.id}
                        className="p-4 border-b last:border-b-0 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium text-sm">{sousActivite.nom}</h4>
                          <p className="text-sm text-gray-500">{sousActivite.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            {sousActivite.intervenant && (
                              <>
                                <span>Responsable: {sousActivite.intervenant.nom}</span>
                                {sousActivite.createdBy && sousActivite.createdAt && (
                                  <>
                                    <span>•</span>
                                    <span>Créé par {sousActivite.createdBy.username}</span>
                                    <span>•</span>
                                    <span>{formatDate(sousActivite.createdAt)}</span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(sousActivite.montantPrevu)}</p>
                            <p className="text-sm text-gray-500">Budget prévu</p>
                            <p className={`text-sm ${subActivityVariance.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {subActivityVariance.isPositive ? '+' : '-'} {subActivityVariance.formatted}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSubActivity(activity, sousActivite)}
                              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubActivity(activity, sousActivite.id)}
                              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <button
                    onClick={() => handleAddSubActivity(activity.id)}
                    className="w-full p-3 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une sous-activité
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedActivity && (
        <>
          <NewSubActivityModal
            isOpen={isNewSubActivityModalOpen}
            onClose={() => {
              setIsNewSubActivityModalOpen(false);
              setSelectedActivity(null);
            }}
            activity={selectedActivity}
            onSubmit={(newSubActivity) => handleNewSubActivity(selectedActivity, newSubActivity)}
          />

          <EditActivityModal
            isOpen={isEditActivityModalOpen}
            onClose={() => {
              setIsEditActivityModalOpen(false);
              setSelectedActivity(null);
            }}
            activity={selectedActivity}
            onSubmit={handleActivityUpdate}
          />

          {selectedSubActivity && (
            <EditSubActivityModal
              isOpen={isEditSubActivityModalOpen}
              onClose={() => {
                setIsEditSubActivityModalOpen(false);
                setSelectedActivity(null);
                setSelectedSubActivity(null);
              }}
              activity={selectedActivity}
              subActivity={selectedSubActivity}
              onSubmit={(updatedSubActivity) => handleSubActivityUpdate(selectedActivity, updatedSubActivity)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ActivityList;