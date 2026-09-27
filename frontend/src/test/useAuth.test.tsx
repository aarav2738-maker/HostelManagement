import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { fakeApi, resetFakeApi, seedAdmin, seedStudent } from './fakeApi';

vi.mock('@/lib/api', async () => {
  const fake = await import('./fakeApi');
  return { api: fake.fakeApi, ApiError: fake.FakeApiError };
});

const { useAuth } = await import('@/hooks/useAuth');

const AUTH_KEY = 'hostel_auth_state';

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    resetFakeApi();
    seedAdmin();
  });

  it('starts in loading state and resolves to logged out', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it('restores a persisted session on mount and validates it with the API', async () => {
    const student = seedStudent();
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ token: `token-${student.id}`, user: null, role: 'student' }),
    );

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.user?.email).toBe('jane@example.com'));
    expect(result.current.isStudent).toBe(true);
  });

  it('signs up a new student and logs them in', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { error?: { message: string } | null } = {};
    await act(async () => {
      response = await result.current.signUp('Student@Example.com', 'secret123', 'Jane Doe', 'A-101');
    });

    expect(response.error ?? null).toBeNull();
    expect(result.current.user?.email).toBe('student@example.com');
    expect(result.current.user?.user_metadata?.full_name).toBe('Jane Doe');
    expect(result.current.role).toBe('student');
    expect(localStorage.getItem(AUTH_KEY)).not.toBeNull();
  });

  it('rejects duplicate signup emails case-insensitively', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp('jane@example.com', 'secret123', 'Jane', 'A-101');
    });
    await act(async () => {
      await result.current.signOut();
    });
    let response: { error?: { message: string } } = {};
    await act(async () => {
      response = await result.current.signUp('JANE@example.com', 'other', 'Janet', 'B-202');
    });
    expect(response.error?.message).toBe('User already exists');
    expect(result.current.user).toBeNull();
  });

  it('rejects invalid credentials', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { error?: { message: string } } = {};
    await act(async () => {
      response = await result.current.signIn('nobody@example.com', 'wrong');
    });
    expect(response.error?.message).toBe('Invalid email or password');
    expect(result.current.user).toBeNull();
  });

  it('signs in a registered student with normalized email', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp('jane@example.com', 'secret123', 'Jane Doe', 'A-101');
    });
    await act(async () => {
      await result.current.signOut();
    });

    let response: { data?: { role: string }; error?: { message: string } | null } = {};
    await act(async () => {
      response = await result.current.signIn('  JANE@example.com ', 'secret123');
    });
    expect(response.error ?? null).toBeNull();
    expect(response.data?.role).toBe('student');
    expect(result.current.user?.email).toBe('jane@example.com');
    expect(result.current.isStudent).toBe(true);
  });

  it('signs in the demo admin account with the admin role', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { data?: { role: string }; error?: { message: string } | null } = {};
    await act(async () => {
      response = await result.current.signIn('admin@hostel.com', 'admin123');
    });
    expect(response.error ?? null).toBeNull();
    expect(response.data?.role).toBe('admin');
    expect(result.current.isAdmin).toBe(true);
  });

  it('signs out and clears persisted state', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signIn('admin@hostel.com', 'admin123');
    });
    expect(result.current.user).not.toBeNull();
    expect(localStorage.getItem(AUTH_KEY)).not.toBeNull();

    await act(async () => {
      await result.current.signOut();
    });
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(localStorage.getItem(AUTH_KEY)).toBeNull();
  });

  it('updates the profile and persists it for the next login', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp('jane@example.com', 'secret123', 'Jane Doe', 'A-101');
    });

    let response: { error?: { message: string } | null } = {};
    await act(async () => {
      response = await result.current.updateProfile({
        full_name: 'Jane Smith',
        phone: '+91 9876500000',
        room_number: 'B-202',
      });
    });
    expect(response.error ?? null).toBeNull();
    expect(result.current.user?.user_metadata?.room_number).toBe('B-202');
    expect(result.current.user?.user_metadata?.phone).toBe('+91 9876500000');

    // Re-login reflects the change since it was saved on the backend
    await act(async () => {
      await result.current.signOut();
    });
    await act(async () => {
      await result.current.signIn('jane@example.com', 'secret123');
    });
    expect(result.current.user?.user_metadata?.full_name).toBe('Jane Smith');
    expect(result.current.user?.user_metadata?.room_number).toBe('B-202');
  });

  it('refuses profile updates when signed out', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { error?: { message: string } | null } = {};
    await act(async () => {
      response = await result.current.updateProfile({ room_number: 'C-303' });
    });
    expect(response.error?.message).toBe('Not signed in');
  });

  it('clears the session when the stored token is no longer valid', async () => {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ token: 'token-ghost', user: null, role: 'student' }),
    );

    const { result } = renderHook(() => useAuth());
    // Optimistic restore shows the user first...
    await waitFor(() => expect(result.current.loading).toBe(false));
    // ...then /auth/me 401s and the stale session is dropped
    await waitFor(() => expect(result.current.user).toBeNull());
    expect(localStorage.getItem(AUTH_KEY)).toBeNull();
  });
});
