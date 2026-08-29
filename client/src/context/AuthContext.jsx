import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' // This sends your HttpOnly cookies!
        });
        const data = await res.json();
        
        if (res.ok && data.status === 'Success') {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, []);

  const login = (userData) => setUser(userData);
  
  const logout = async () => {
    setUser(null);
    try {
      // Tell backend to clear cookies
      await fetch('http://localhost:5000/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch(err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};