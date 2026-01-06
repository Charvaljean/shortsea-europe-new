
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { storageService } from '../services/storageService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('shortsea_session');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const result = await storageService.loginUser(email, pass);
    
    if (result.user) {
      await storageService.claimGuestData(result.user.id, result.user.name, result.user.company);
      setUser(result.user);
      localStorage.setItem('shortsea_session', JSON.stringify(result.user));
      return { success: true };
    } else {
      if (result.error === 'unverified') {
          return { success: false, error: 'Email not verified' };
      }
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const register = async (data: Partial<User>, pass: string) => {
    try {
      const newUser = await storageService.saveUser(data, pass);
      return { success: true, requiresVerification: true, email: newUser.email };
    } catch (e) {
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shortsea_session');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('shortsea_session', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
