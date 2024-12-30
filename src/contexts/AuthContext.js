import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      
      const currentPath = window.location.pathname;
      const isAdminPath = currentPath.startsWith('/admin');
      
      if (user.role === 'admin' && !isAdminPath) {
        navigate('/admin');
      } else if (user.role !== 'admin' && isAdminPath) {
        navigate('/');
      }
    }
  }, [navigate]);

  const login = async (userData) => {
    try {
      const user = {
        id: userData.id,
        name: userData.name,
        prenom: userData.prenom,
        email: userData.email,
        role: userData.role
      };
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAdmin', userData.role === 'admin');

      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const value = {
    currentUser,
    login,
    logout,
    isAdmin: currentUser?.role === 'admin',
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
