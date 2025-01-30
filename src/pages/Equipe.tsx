import React from 'react';
import TeamMembers from '../components/TeamMembers';

const sampleMembers = [
  {
    nom: "Jean Dupont",
    role: "Chef de projet",
    sousActivites: []
  },
  {
    nom: "Marie Martin",
    role: "Développeuse principale",
    sousActivites: []
  },
  {
    nom: "Pierre Durand",
    role: "Designer UI/UX",
    sousActivites: []
  },
  {
    nom: "Sophie Bernard",
    role: "Spécialiste marketing",
    sousActivites: []
  }
];

function Equipe() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Équipe</h1>
        <p className="text-gray-600">Gérez les membres de l'équipe et leurs rôles.</p>
      </div>
      <TeamMembers members={sampleMembers} />
    </>
  );
}

export default Equipe;