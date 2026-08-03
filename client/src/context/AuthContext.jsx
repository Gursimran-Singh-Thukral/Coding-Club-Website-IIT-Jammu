import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// CHANGE THIS CONFIGURATION TO TOGGLE ADMIN / STUDENT STATUS
const IS_ADMIN = false; // Set to true for Admin profile and admin routes, false for normal student

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Start as guest/not signed in

  const login = () => {
    setUser({
      username: IS_ADMIN ? 'aryancodes' : 'rohit_dev',
      isAdmin: IS_ADMIN
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
