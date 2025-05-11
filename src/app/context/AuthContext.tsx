"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

// Shape of the context
type AuthContextType = {
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  switchToRegister: () => void;
  switchToLogin: () => void;
  isLoggedIn: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  loginError: string | null;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const closeLoginModal = () => {
    setLoginError(null);
    setIsLoginModalOpen(false);
  };

  //need to learn about Promise/ undefinied, and session
  
  const login = async (identifier: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoginError(result.error);
      } else {
        closeLoginModal();
      }
    } catch (error) {
      console.error('Login error', error);
      setLoginError('An unexpected error occurred');
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  const openLoginModal = () => {
    setLoginError(null);
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };
  
  const openRegisterModal = () => {
    setLoginError(null);
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };
  
  const closeRegisterModal = () => {
    setLoginError(null);
    setIsRegisterModalOpen(false);
  };

  const switchToRegister = () => {
    setLoginError(null);
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };
  
  const switchToLogin = () => {
    setLoginError(null);
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };
  
  // Value for consumer
  const value = {
    isLoginModalOpen,
    isRegisterModalOpen,
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
    switchToRegister,
    switchToLogin,
    isLoggedIn: status === 'authenticated',
    login, 
    logout,
    session,
    status,
    loginError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
   
