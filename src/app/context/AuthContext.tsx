"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect, use } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import apiClient from '@/lib/apiClient';
import authService, {RegisterData} from '@/api/auth';


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
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  loginError: string | null;
  registerError: string | null;
  isLoading: boolean;
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
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const closeLoginModal = () => {
    setLoginError(null);
    setIsLoginModalOpen(false);
  };

  const closeRegisterModal = () => {
    setLoginError(null);
    setIsRegisterModalOpen(false);
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
  const register = async ( data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setRegisterError(null);

    try{
      const result = await authService.register(data);
      if (result) {

        closeRegisterModal();
        switchToLogin();
        return true;
      } else {
        setRegisterError("Registeration Failed");
        return false;
      } 
    } catch (error) {
      console.error('Registration error', error);
      setRegisterError('An unexpected error occurred');
      return false;
    }
  }


  const logout = async () => {
    setIsLoading(true)
    try{
      await signOut({ redirect: false });
    }catch (error) {
      console.error("Error during logout", error);
    }
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

  const switchToRegister = () => {
    setLoginError(null);
    setRegisterError(null);
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };
  
  const switchToLogin = () => {
    setLoginError(null);
    setRegisterError(null);
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
    register,
    logout,
    session,
    status,
    loginError,
    registerError,
    isLoading
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
   
