import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Projets from './pages/Projets';
import ProjectDetails from './pages/ProjectDetails';
import Activites from './pages/Activites';
import Equipe from './pages/Equipe';
import Depenses from './pages/Depenses';
import Rapports from './pages/Rapports';
import Parametres from './pages/Parametres';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetPassword from './pages/SetPassword';
import GroupManagement from './pages/GroupManagement';
import { authService } from './services/authService';


function PrivateRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Vérifier l'authentification
    const checkAuth = async () => {
      const token = authService.getToken();
      if (!token || authService.isTokenExpired(token)) {  // Passer le token ici
        // Si pas de token ou token expiré, rediriger vers la connexion
        authService.removeTokens();
        navigate('/login');
      }
    };

    
    
    checkAuth();
  }, [navigate]);

  // Vérifier le token avant de rendre le contenu
  const token = authService.getToken();
  if (!token || authService.isTokenExpired(token)) {  // Passer le token ici
    return null; // Ne rien rendre pendant la redirection
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-8 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/projets" element={<PrivateRoute><Projets /></PrivateRoute>} />
        <Route path="/projets/:id" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />
        <Route path="/activites" element={<PrivateRoute><Activites /></PrivateRoute>} />
        <Route path="/equipe" element={<PrivateRoute><Equipe /></PrivateRoute>} />
        <Route path="/depenses" element={<PrivateRoute><Depenses /></PrivateRoute>} />
        <Route path="/rapports" element={<PrivateRoute><Rapports /></PrivateRoute>} />
        <Route path="/utilisateurs" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/parametres" element={<PrivateRoute><Parametres /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/groupes" element={<PrivateRoute><GroupManagement /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
