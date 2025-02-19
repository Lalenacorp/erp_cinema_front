import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Film, 
  Activity, 
  Users, 
  Receipt, 
  FileText, 
  Settings,
  UserCog 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Tableau de bord', path: '/' },
    { icon: <Film className="w-5 h-5" />, label: 'Projets', path: '/projets' },
    { icon: <Activity className="w-5 h-5" />, label: 'Activités', path: '/activites' },
   // { icon: <Users className="w-5 h-5" />, label: 'Équipe', path: '/equipe' },
    { icon: <Receipt className="w-5 h-5" />, label: 'Dépenses', path: '/depenses' },
    { icon: <FileText className="w-5 h-5" />, label: 'Rapports', path: '/rapports' },
    { icon: <UserCog className="w-5 h-5" />, label: 'Utilisateurs', path: '/utilisateurs' },
    { icon: <UserCog className="w-5 h-5" />, label: 'Groupes', path: '/groupes' },

   // { icon: <Settings className="w-5 h-5" />, label: 'Paramètres', path: '/parametres' },
  ];

  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 text-white p-4">
      <div className="flex items-center gap-2 mb-8">
        <Film className="w-8 h-8" />
        <h1 className="text-xl font-bold">CinéManager</h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-gray-800 text-white'
                : 'hover:bg-gray-800'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;