import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import type { AppRole, User, Session, ProfileUpdates } from '@/lib/types';

export type { AppRole, User, Session, ProfileUpdates };

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
}

interface AuthResponse {
  token: string;
  user: User;
  role: AppRole;
}

const STORAGE_KEY = 'hostel_auth_state';

const persist = (state: { token: string; user: User; role: AppRole } | null) => {
  if (state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const asSession = (token: string, user: User): Session => ({ access_token: token, user });

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      return;
    }

    // Optimistically restore the saved session, then confirm it with the
    // backend so a revoked/expired token logs the user out on next visit.
    try {
      const saved = JSON.parse(raw) as { token: string; user: User; role: AppRole };
      setAuthState({
        user: saved.user,
        session: asSession(saved.token, saved.user),
        role: saved.role,
        loading: false,
      });
      api.get<AuthResponse>('/auth/me')
        .then((me) => {
          persist({ token: saved.token, user: me.user, role: me.role });
          setAuthState({
            user: me.user,
            session: asSession(saved.token, me.user),
            role: me.role,
            loading: false,
          });
        })
        .catch((error) => {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            persist(null);
            setAuthState({ user: null, session: null, role: null, loading: false });
          }
        });
    } catch {
      persist(null);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const applyAuth = ({ token, user, role }: AuthResponse) => {
    persist({ token, user, role });
    setAuthState({ user, session: asSession(token, user), role, loading: false });
  };

  const signUp = async (email: string, password: string, fullName: string, roomNumber: string) => {
    try {
      const res = await api.post<AuthResponse>('/auth/signup', {
        email: email.trim(),
        password,
        full_name: fullName,
        room_number: roomNumber,
      });
      applyAuth(res);
      return { data: { user: res.user }, error: null };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : 'Signup failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      applyAuth(res);
      return { data: { user: res.user, role: res.role }, error: null };
    } catch (error) {
      return { data: undefined, error: { message: error instanceof Error ? error.message : 'Sign in failed' } };
    }
  };

  const updateProfile = async (updates: ProfileUpdates) => {
    if (!authState.user || !authState.session) {
      return { error: { message: 'Not signed in' } };
    }
    try {
      const res = await api.patch<AuthResponse>('/auth/profile', updates);
      persist({ token: authState.session.access_token, user: res.user, role: res.role });
      setAuthState({
        user: res.user,
        session: asSession(authState.session.access_token, res.user),
        role: res.role,
        loading: false,
      });
      return { error: null };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Profile update failed' } };
    }
  };

  const signOut = async () => {
    persist(null);
    setAuthState({ user: null, session: null, role: null, loading: false });
    return { error: null };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin: authState.role === 'admin',
    isStudent: authState.role === 'student',
  };
}
