"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import authService, {RegisterData} from '@/services/auth/auth';
import { ERROR_MESSAGES } from '@/errors/errorCode';
import axios from 'axios';

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
    setRegisterError(null);
    setIsRegisterModalOpen(false);
  };
  
  const login = async (identifier: string, password: string) => {
    try {
      setIsLoading(true);
      setLoginError(null);
      
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        // The error here is already a user-friendly message from NextAuth
        // It comes from the throw new Error() in the authorize function
        setLoginError(result.error);
        console.error("Authentication error:", result.error);
      } else {
        closeLoginModal();
      }
    } catch (error) {
      console.error('Login error', error);
      // Use the generic error code for unexpected errors
      setLoginError(ERROR_MESSAGES[9999]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setRegisterError(null);

    try {
      const result = await authService.register(data);
      console.log("Registration success:", result);
      if (result) {
        closeRegisterModal();
        switchToLogin();
        return true;
      } else {
        console.log("Registration result was falsy");
        setRegisterError(ERROR_MESSAGES[1001]); // User already exists
        return false;
      } 
    } catch (error) {
      console.error('Registration error', error);
      if(error && typeof error === 'object' && 'code' in error){
        const errorCode = Number(error.code) || 9999;
        setRegisterError(ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[9999]);
      } else {
        setRegisterError(ERROR_MESSAGES[9999]);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Error during logout", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openLoginModal = () => {
    setLoginError(null);
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };
  
  const openRegisterModal = () => {
    setRegisterError(null);
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
   
