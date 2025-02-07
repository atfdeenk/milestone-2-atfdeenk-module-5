import React from 'react';

export const AuthContext = React.createContext({
  user: null,
  loading: false,
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children, value }: { children: React.ReactNode; value?: any }) => {
  return (
    <AuthContext.Provider value={value || { user: null, loading: false, setUser: () => {}, logout: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
};
