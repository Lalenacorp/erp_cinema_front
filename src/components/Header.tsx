import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, User, Settings, LogOut } from 'lucide-react';
import { authService } from '../services/authService';

const Header = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const currentUser = authService.getCurrentUser();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 fixed top-0 right-0 left-64">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || '')}&background=random`}
              alt="Profil"
              className="w-8 h-8 rounded-full"
            />
            <div className="text-left">
              <p className="text-sm font-medium">{currentUser?.username}</p>
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <User className="w-5 h-5 text-gray-500" />
                <span>Mon profil</span>
              </Link>
              <Link
                to="/parametres"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span>Paramètres</span>
              </Link>
              <div className="border-t my-2"></div>
              <button
                onClick={() => {
                  authService.logout();
                  setIsProfileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors w-full text-left text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;