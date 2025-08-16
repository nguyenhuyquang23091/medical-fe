// UI component-related types and interfaces

export interface ProfileDropdownProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onViewProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

// AuthContext types for UI state management
export interface AuthContextType {
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
  register: (data: any) => Promise<boolean>; // Will be properly typed when importing RegisterData
  session: any; // NextAuth Session type
  status: "loading" | "authenticated" | "unauthenticated";
  loginError: string | null;
  registerError: string | null;
  isLoading: boolean;
}