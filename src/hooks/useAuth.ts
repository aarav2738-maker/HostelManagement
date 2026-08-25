import { useState, useEffect, useCallback } from 'react';

export type AppRole = 'admin' | 'student';

// Mock types to match Supabase for easy swapping
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    room_number?: string;
  };
}

export interface Session {
  access_token: string;
  user: User;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
}

const STORAGE_KEY = 'hostel_auth_state';
const USERS_KEY = 'hostel_users';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // Load auth state from local storage on mount
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setAuthState({
          user: parsed.user,
          session: parsed.session,
          role: parsed.role,
          loading: false,
        });
      } catch (e) {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const saveAuthState = (user: User | null, role: AppRole | null) => {
    const session = user ? { access_token: 'mock-token', user } : null;
    const newState = { user, session, role, loading: false };
    setAuthState(newState);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, roomNumber: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      return { error: { message: 'User already exists' } };
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      user_metadata: {
        full_name: fullName,
        room_number: roomNumber
      }
    };

    // Store user credentials (in plain text just for this mock)
    users.push({ ...newUser, password, role: 'student' });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    saveAuthState(newUser, 'student');
    return { data: { user: newUser }, error: null };
  };

  const signIn = async (email: string, password: string) => {
    
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    
    // Check if it's admin (hardcoded admin for demo purposes)
    if (normalizedEmail === 'admin@hostel.com' && normalizedPassword === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@hostel.com',
        user_metadata: { full_name: 'Administrator' }
      };
      saveAuthState(adminUser, 'admin');
      return { data: { user: adminUser }, error: null };
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email.toLowerCase() === normalizedEmail && u.password === password);

    if (user) {
      const authUser: User = { id: user.id, email: user.email, user_metadata: user.user_metadata };
      saveAuthState(authUser, user.role);
      return { data: { user: authUser }, error: null };
    }

    return { error: { message: 'Invalid credentials. Use admin@hostel.com/admin123 for Admin access.' } };
  };

  const signOut = async () => {
    saveAuthState(null, null);
    return { error: null };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    isAdmin: authState.role === 'admin',
    isStudent: authState.role === 'student',
  };
}
