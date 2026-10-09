import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const PRESET_USERS = [
  { email: 'admin@bookmg.com', password: 'admin123', name: 'Admin User', role: 'ROLE_ADMIN', dept: 'IT' },
  { email: 'manager@bookmg.com', password: 'manager123', name: 'Sarah Jenkins', role: 'ROLE_MANAGER', dept: 'ENGINEERING' },
  { email: 'user@bookmg.com', password: 'user123', name: 'Alex Rivera', role: 'ROLE_EMPLOYEE', dept: 'ENGINEERING' },
  { email: 'hr@bookmg.com', password: 'hr123', name: 'Elena Rostova', role: 'ROLE_MANAGER', dept: 'HR' },
  { email: 'sales@bookmg.com', password: 'sales123', name: 'David Miller', role: 'ROLE_EMPLOYEE', dept: 'SALES' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem('bookmg_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any old persistent token from localStorage on fresh boot to ensure logged-out start
    localStorage.removeItem('bookmg_token');

    const initAuth = async () => {
      const sessionToken = sessionStorage.getItem('bookmg_token');
      if (sessionToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
          setToken(sessionToken);
        } catch (err) {
          console.warn('Session expired or invalid, logging out', err);
          logout();
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { accessToken, user } = res.data;
    sessionStorage.setItem('bookmg_token', accessToken);
    setToken(accessToken);
    if (user) {
      setUser(user);
      return user;
    }
    const meRes = await authApi.getMe();
    setUser(meRes.data);
    return meRes.data;
  };

  const register = async ({ email, password, fullName, department, role }) => {
    const res = await authApi.register({
      email,
      password,
      fullName,
      department,
      role: role || 'ROLE_EMPLOYEE',
    });
    const { accessToken, user } = res.data;
    sessionStorage.setItem('bookmg_token', accessToken);
    setToken(accessToken);
    if (user) {
      setUser(user);
      return user;
    }
    try {
      const meRes = await authApi.getMe();
      setUser(meRes.data);
      return meRes.data;
    } catch {
      const fallbackUser = {
        email,
        fullName,
        department,
        role: role || 'ROLE_EMPLOYEE',
      };
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('bookmg_token');
    localStorage.removeItem('bookmg_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitch = async (presetUser) => {
    return login(presetUser.email, presetUser.password);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isManager = user?.role === 'ROLE_MANAGER';
  const canApprove = isAdmin || isManager;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickSwitch,
        isAdmin,
        isManager,
        canApprove,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
