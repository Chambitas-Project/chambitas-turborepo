import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/api-client';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await apiClient.getProfile();
      if (data.role === 'admin') {
        setUser(data);
      } else {
        // Si no es admin, cerramos sesión de inmediato y bloqueamos el acceso
        await apiClient.logout();
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials: any) => {
    await apiClient.login(credentials);
    const data = await apiClient.getProfile();
    if (data.role !== 'admin') {
      await apiClient.logout();
      setUser(null);
      throw new Error('Acceso denegado: Se requieren permisos de administrador.');
    }
    setUser(data);
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
