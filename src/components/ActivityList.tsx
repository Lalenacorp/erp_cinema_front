import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Activity, SubActivity } from '../types';
import NewSubActivityModal from './NewSubActivityModal';
import EditSubActivityModal from './EditSubActivityModal';
import EditActivityModal from './EditActivityModal';
import DeleteActivityModal from './DeleteActivityModal';
import DeleteSubActivityModal from './DeleteSubActivityModal';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';

interface ActivityListProps {
  activities?: Activity[];
  onUpdateActivity?: (activityId: number, updatedActivity: Activity) => void;
  onDeleteActivity?: (activityId: number) => void;
}

// Helper functions
const calculateBudgetVariance = (estimated: string | null, spent: string | null): {
  value: number;
  isPositive: boolean;
  formatted: string;
  percentage: string;
} => {
  const estimatedNum = parseFloat(estimated || '0');
  const spentNum = parseFloat(spent || '0');
  const variance = estimatedNum - spentNum;
  
  return {
    value: variance,
    isPositive: variance >= 0,
    formatted: new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(Math.abs(variance)),
    percentage: estimatedNum ? ((variance / estimatedNum) * 100).toFixed(1) : '0'
  };
};

const formatCurrency = (amount: string | number) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(numericAmount);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString));
};

// Sub-components for better organization
const ActivityHeader: React.FC<{
  activity: Activity;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ activity, isExpanded, onToggle, onEdit, onDelete }) => {
  const activityVariance = calculateBudgetVariance(
    activity.total_amount_estimated,
    activity.total_amount_spent
  );

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-1 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{activity.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span>Responsable: {activity.activity_manager}</span>
              <span>•</span>
              <span>{formatDate(activity.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">
                {formatCurrency(activity.total_amount_estimated || '0')}
              </p>
              <p className="text-sm text-gray-500">Budget</p>
              <p className={`text-sm ${activityVariance.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {activityVariance.isPositive ? '+' : '-'} {activityVariance.formatted}
              </p>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={onEdit}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          title="Modifier l'activité"
        >
          <Pencil className="w-4 h-4 text-blue-600" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          title="Supprimer l'activité"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  );
};

const SubActivityItem: React.FC<{
  subActivity: SubActivity;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ subActivity, onEdit, onDelete }) => {
  const subActivityVariance = calculateBudgetVariance(
    subActivity.amount_estimated,
    subActivity.amount_spent
  );

  return (
    <div className="p-4 border-b last:border-b-0 flex items-center justify-between hover:bg-gray-100 transition-colors">
      <div>
        <h4 className="font-medium text-sm">{subActivity.name}</h4>
        <p className="text-sm text-gray-500">{subActivity.description}</p>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
          <span>Créé le {formatDate(subActivity.created_at)}</span>
          {subActivity.dateDebut && subActivity.dateFin && (
            <>
              <span>•</span>
              <span>
                Du {formatDate(subActivity.dateDebut)} au {formatDate(subActivity.dateFin)}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium">{formatCurrency(subActivity.amount_estimated)}</p>
          <p className="text-sm text-gray-500">Budget prévu</p>
          <p className={`text-sm ${subActivityVariance.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {subActivityVariance.isPositive ? '+' : '-'} {subActivityVariance.formatted}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            title="Modifier la sous-activité"
          >
            <Pencil className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            title="Supprimer la sous-activité"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityList: React.FC<ActivityListProps> = ({ 
  activities = [],
  onUpdateActivity,
  onDeleteActivity
}) => {
  const [expandedActivities, setExpandedActivities] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubActivity, setSelectedSubActivity] = useState<SubActivity | null>(null);
  const [isNewSubActivityModalOpen, setIsNewSubActivityModalOpen] = useState(false);
  const [isEditSubActivityModalOpen, setIsEditSubActivityModalOpen] = useState(false);
  const [isEditActivityModalOpen, setIsEditActivityModalOpen] = useState(false);
  const [isDeleteActivityModalOpen, setIsDeleteActivityModalOpen] = useState(false);
  const [isDeleteSubActivityModalOpen, setIsDeleteSubActivityModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleActivity = (activityName: string) => {
    setExpandedActivities(prev =>
      prev.includes(activityName)
        ? prev.filter(name => name !== activityName)
        : [...prev, activityName]
    );
  };

  const handleAddSubActivity = (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setSelectedActivity(activity);
      setIsNewSubActivityModalOpen(true);
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsEditActivityModalOpen(true);
  };

  const handleDeleteActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDeleteActivityModalOpen(true);
  };

  const confirmDeleteActivity = async () => {
    if (!selectedActivity || !onDeleteActivity) return;

    setIsDeleting(true);
    try {
      await onDeleteActivity(selectedActivity.id);
      setIsDeleteActivityModalOpen(false);
      toast.success('Activité supprimée avec succès');
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'activité");
    } finally {
      setIsDeleting(false);
      setSelectedActivity(null);
    }
  };

  const handleEditSubActivity = (activity: Activity, subActivity: SubActivity) => {
    setSelectedActivity(activity);
    setSelectedSubActivity(subActivity);
    setIsEditSubActivityModalOpen(true);
  };

  const handleDeleteSubActivity = (activity: Activity, subActivity: SubActivity) => {
    setSelectedActivity(activity);
    setSelectedSubActivity(subActivity);
    setIsDeleteSubActivityModalOpen(true);
  };

  const confirmDeleteSubActivity = async () => {
    if (!selectedActivity || !selectedSubActivity || !onUpdateActivity) return;

    setIsDeleting(true);
    try {
      // Call the API to delete the sub-activity
      await apiService.deleteSubActivity(selectedSubActivity.id);

      // Update the activity with the sub-activity removed
      const updatedActivity = {
        ...selectedActivity,
        activity_subactivity: selectedActivity.activity_subactivity.filter(
          sa => sa.id !== selectedSubActivity.id
        )
      };

      // Recalculate total amounts
      const totalEstimated = updatedActivity.activity_subactivity.reduce(
        (sum, sa) => sum + parseFloat(sa.amount_estimated),
        0
      ).toString();

      const totalSpent = updatedActivity.activity_subactivity.reduce(
        (sum, sa) => sum + parseFloat(sa.amount_spent || '0'),
        0
      ).toString();

      updatedActivity.total_amount_estimated = totalEstimated;
      updatedActivity.total_amount_spent = totalSpent;
      updatedActivity.activity_gap = (
        parseFloat(totalEstimated) - parseFloat(totalSpent)
      ).toString();

      // Update the activity in the parent component
      onUpdateActivity(selectedActivity.id, updatedActivity);
      
      setIsDeleteSubActivityModalOpen(false);
      toast.success('Sous-activité supprimée avec succès');
    } catch (error) {
      console.error('Error deleting sub-activity:', error);
      toast.error("Erreur lors de la suppression de la sous-activité");
    } finally {
      setIsDeleting(false);
      setSelectedActivity(null);
      setSelectedSubActivity(null);
    }
  };

  const handleSubActivityUpdate = async (activity: Activity, updatedSubActivity: SubActivity) => {
    if (!onUpdateActivity) return;

    try {
      // Update the sub-activity through the API
      await apiService.updateSubActivity(updatedSubActivity.id, updatedSubActivity);

      // Update the activity with the updated sub-activity
      const updatedActivity = {
        ...activity,
        activity_subactivity: activity.activity_subactivity.map(sa => 
          sa.id === updatedSubActivity.id ? updatedSubActivity : sa
        )
      };

      // Recalculate total amounts
      const totalEstimated = updatedActivity.activity_subactivity.reduce(
        (sum, sa) => sum + parseFloat(sa.amount_estimated),
        0
      ).toString();

      const totalSpent = updatedActivity.activity_subactivity.reduce(
        (sum, sa) => sum + parseFloat(sa.amount_spent || '0'),
        0
      ).toString();

      updatedActivity.total_amount_estimated = totalEstimated;
      updatedActivity.total_amount_spent = totalSpent;
      updatedActivity.activity_gap = (
        parseFloat(totalEstimated) - parseFloat(totalSpent)
      ).toString();

      onUpdateActivity(activity.id, updatedActivity);
      setIsEditSubActivityModalOpen(false);
      toast.success('Sous-activité mise à jour avec succès');
    } catch (error) {
      console.error('Error updating sub-activity:', error);
      toast.error("Erreur lors de la mise à jour de la sous-activité");
    }
  };

  return (
    <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
      {activities.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Aucune activité
        </div>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="bg-white">
            <ActivityHeader
              activity={activity}
              isExpanded={expandedActivities.includes(activity.name)}
              onToggle={() => toggleActivity(activity.name)}
              onEdit={() => handleEditActivity(activity)}
              onDelete={() => handleDeleteActivity(activity)}
            />
            
            {expandedActivities.includes(activity.name) && (
              <div className="border-t">
                {activity.activity_subactivity.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {activity.activity_subactivity.map((subActivity) => (
                      <SubActivityItem
                        key={subActivity.id}
                        subActivity={subActivity}
                        onEdit={() => handleEditSubActivity(activity, subActivity)}
                        onDelete={() => handleDeleteSubActivity(activity, subActivity)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-center text-gray-500">
                    Aucune sous-activité
                  </p>
                )}
                
                <div className="p-4 border-t">
                  <button
                    onClick={() => handleAddSubActivity(activity.id)}
                    className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une sous-activité
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {selectedActivity && (
        <>
          <NewSubActivityModal
            isOpen={isNewSubActivityModalOpen}
            onClose={() => setIsNewSubActivityModalOpen(false)}
            onSubmit={async (newSubActivity) => {
              handleSubActivityUpdate(selectedActivity, newSubActivity);
              setIsNewSubActivityModalOpen(false);
            }}
            activityId={selectedActivity.id}
          />

          <EditSubActivityModal
            isOpen={isEditSubActivityModalOpen}
            onClose={() => setIsEditSubActivityModalOpen(false)}
            activity={selectedActivity}
            subActivity={selectedSubActivity}
            onSubmit={(updatedSubActivity) => {
              handleSubActivityUpdate(selectedActivity, updatedSubActivity);
            }}
          />

          <EditActivityModal
            isOpen={isEditActivityModalOpen}
            onClose={() => setIsEditActivityModalOpen(false)}
            activity={selectedActivity}
            onSubmit={(updatedActivity) => {
              if (onUpdateActivity) {
                onUpdateActivity(selectedActivity.id, updatedActivity);
                setIsEditActivityModalOpen(false);
                toast.success('Activité mise à jour avec succès');
              }
            }}
          />

          <DeleteActivityModal
            isOpen={isDeleteActivityModalOpen}
            onClose={() => {
              setIsDeleteActivityModalOpen(false);
              setSelectedActivity(null);
            }}
            onConfirm={confirmDeleteActivity}
            activityName={selectedActivity.name}
            isLoading={isDeleting}
          />

          {selectedSubActivity && (
            <DeleteSubActivityModal
              isOpen={isDeleteSubActivityModalOpen}
              onClose={() => {
                setIsDeleteSubActivityModalOpen(false);
                setSelectedSubActivity(null);
              }}
              onConfirm={confirmDeleteSubActivity}
              subActivityName={selectedSubActivity.name}
              isLoading={isDeleting}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ActivityList;