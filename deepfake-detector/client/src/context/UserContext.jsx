import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import UserContext from './user-context';

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const clearUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const setSession = useCallback((nextToken, nextUser = null) => {
    if (nextToken) {
      localStorage.setItem('token', nextToken);
      setToken(nextToken);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }

    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setToken(storedToken);
      const response = await api.get('/users/me');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        clearUser();
      } else {
        setLoading(false);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clearUser]);

  useEffect(() => {
    fetchUser().catch(() => {});
  }, [fetchUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: Boolean(token),
        setSession,
        refreshUser: fetchUser,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
