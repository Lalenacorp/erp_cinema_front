import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User as UserIcon, Settings, LogOut, Projector as Project, Users, FileText } from 'lucide-react';
import { authService } from '../services/authService';
import type { User } from '../types';
import { useDebounce } from '../hooks/useDebonce';

interface SearchResult {
  id: string | number;
  type: 'project' | 'user' | 'document';
  title: string;
  subtitle?: string;
  url: string;
}

const Header = () => {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
      }
    };
    loadUser();
  }, []);

 

  const getInitials = (email: string): string => {
    return email
      .split('@')[0]
      .slice(0, 2)
      .toUpperCase();
  };

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Project className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleSearchBlur = () => {
    // Petit délai pour permettre la navigation lors du clic sur un résultat
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <div className="relative">
            
            
          </div>

          {/* Résultats de recherche */}
        
        </div>
      </div>
      
      <div className="flex items-center gap-4">
    {/*     <button className="relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span>
        </button> */}

        <div className="relative">
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {currentUser?.email ? getInitials(currentUser.email) : 'NA'}
              </span>
            </div>
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
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span>Mon profil</span>
              </Link>
            {/*   <Link
                to="/parametres"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span>Paramètres</span>
              </Link> */}
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