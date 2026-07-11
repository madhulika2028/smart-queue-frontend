import { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('smartQueueUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setAuthToken(parsed.token);
      } catch (err) {
        console.error('Failed to parse user from localStorage', err);
        localStorage.removeItem('smartQueueUser');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    setAuthToken(userData.token);
    localStorage.setItem('smartQueueUser', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('smartQueueUser');
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, login: loginUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
