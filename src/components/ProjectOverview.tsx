import React from 'react';
import { BarChart3, Clock, DollarSign, Users } from 'lucide-react';

const ProjectOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        {
          title: 'Budget Total',
          value: '1 240 000 €',
          change: '+12%',
          icon: <DollarSign className="w-6 h-6 text-green-500" />,
        },
        {
          title: 'Activités en cours',
          value: '8',
          change: '+2',
          icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
        },
        {
          title: 'Équipe',
          value: '45',
          change: '+5',
          icon: <Users className="w-6 h-6 text-purple-500" />,
        },
        {
          title: 'Jours de tournage',
          value: '45 jours',
          change: '-2 jours',
          icon: <Clock className="w-6 h-6 text-orange-500" />,
        },
      ].map((item) => (
        <div
          key={item.title}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gray-100 p-3 rounded-lg">{item.icon}</div>
            <span className={`text-sm font-medium ${
              item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
            }`}>
              {item.change}
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">{item.title}</h3>
          <p className="text-2xl font-semibold mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ProjectOverview;