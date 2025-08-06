import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminCredential {
  name: string;
  login_id: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentAdmin: AdminCredential | null;
  login: (loginId: string, password: string) => Promise<boolean>;
  logout: () => void;
  adminCredentials: AdminCredential[];
}

const adminCredentials: AdminCredential[] = [
  { name: 'Ankit', login_id: 'ankit.admin', password: 'ankit@2024' },
  { name: 'Harshita', login_id: 'harshita.admin', password: 'harshita@2024' },
  { name: 'Shantanu', login_id: 'shantanu.admin', password: 'shantanu@2024' },
  { name: 'Ayush', login_id: 'ayush.admin', password: 'ayush@2024' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminCredential | null>(null);

  useEffect(() => {
    // Check if user was previously logged in
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (savedAdmin) {
      try {
        const admin = JSON.parse(savedAdmin);
        setCurrentAdmin(admin);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved admin data:', error);
        localStorage.removeItem('currentAdmin');
      }
    }
  }, []);

  const login = async (loginId: string, password: string): Promise<boolean> => {
    const admin = adminCredentials.find(
      (cred) => cred.login_id === loginId && cred.password === password
    );

    if (admin) {
      setCurrentAdmin(admin);
      setIsAuthenticated(true);
      localStorage.setItem('currentAdmin', JSON.stringify(admin));
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentAdmin');
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentAdmin,
    login,
    logout,
    adminCredentials,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
