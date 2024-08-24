'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextProps {
  user: User | null;
  logout:()=>void;
}

const AuthContext = createContext<AuthContextProps>({ user: null,logout:()=>{}});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

const logout = () =>{
    signOut(auth);
}

const assignUser =(user:User) => {
  setUser(user);
}

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user:any) => {
      console.log('user object: ', user);
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user,logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);