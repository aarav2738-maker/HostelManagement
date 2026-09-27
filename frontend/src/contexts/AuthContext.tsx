import { createContext, useContext, ReactNode } from 'react';
import { useAuth, AppRole, User, Session, ProfileUpdates } from '@/hooks/useAuth';

interface SignInResult {
  data?: { user: User; role: AppRole };
  error?: { message: string };
}

interface UpdateProfileResult {
  error?: { message: string };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  signUp: (email: string, password: string, fullName: string, roomNumber: string) => Promise<{ data?: unknown; error?: { message: string } }>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<{ error: null }>;
  updateProfile: (updates: ProfileUpdates) => Promise<UpdateProfileResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
