import React from 'react';
import type { Intervenant } from '../types/auth';

const TeamMembers = ({ members }: { members: Intervenant[] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Membres de l'équipe</h2>
        <button className="text-blue-500 text-sm font-medium">Voir tout</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => (
          <div
            key={member.nom}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=random`}
              alt={member.nom}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-medium">{member.nom}</h3>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers