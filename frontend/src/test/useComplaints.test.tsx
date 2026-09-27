import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { fakeApi, resetFakeApi, getComplaints, seedAdmin, seedStudent } from './fakeApi';

vi.mock('@/lib/api', async () => {
  const fake = await import('./fakeApi');
  return { api: fake.fakeApi, ApiError: fake.FakeApiError };
});

const { useComplaints } = await import('@/hooks/useComplaints');
const { useAuth } = await import('@/hooks/useAuth');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useComplaints', () => {
  beforeEach(() => {
    localStorage.clear();
    resetFakeApi();
  });

  const signIn = async (email: string, password: string) => {
    const auth = renderHook(() => useAuth());
    await act(async () => {
      await auth.result.current.signIn(email, password);
    });
  };

  const signUpStudent = async () => {
    const auth = renderHook(() => useAuth());
    await act(async () => {
      await auth.result.current.signUp('jane@example.com', 'secret123', 'Jane Doe', 'A-101');
    });
  };

  it('starts with no complaints', async () => {
    const { result } = renderHook(() => useComplaints(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.complaints).toEqual([]);
  });

  it('creates a complaint; the server falls back to the student room and injects the user', async () => {
    await signUpStudent();
    const { result } = renderHook(() => useComplaints(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createComplaint.mutateAsync({
        title: 'Leaking tap',
        description: 'The bathroom tap keeps dripping.',
        category: 'water',
        priority: 'high',
        room_number: '',
        image_url: null,
      });
    });

    await waitFor(() => expect(result.current.complaints).toHaveLength(1));
    const complaint = result.current.complaints[0];
    expect(complaint.title).toBe('Leaking tap');
    expect(complaint.status).toBe('pending');
    expect(complaint.room_number).toBe('A-101');
    expect(complaint.resolved_at).toBeNull();
    const stored = getComplaints()[0];
    expect(stored.user_id).toBe(seedStudent && getComplaints()[0].user_id);
  });

  it('rejects creation when not authenticated', async () => {
    const { result } = renderHook(() => useComplaints(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      result.current.createComplaint.mutateAsync({
        title: 'Nope',
        description: 'Should fail',
        category: 'other',
        priority: 'low',
        room_number: 'X-1',
        image_url: null,
      }),
    ).rejects.toThrow('Not authenticated');
  });

  it('sorts newest first and admins resolve complaints with metadata', async () => {
    seedAdmin();
    await signUpStudent();
    const { result } = renderHook(() => useComplaints(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let firstId = '';
    await act(async () => {
      const created = await result.current.createComplaint.mutateAsync({
        title: 'First',
        description: 'First complaint',
        category: 'wifi',
        priority: 'medium',
        room_number: 'A-101',
        image_url: null,
      });
      firstId = created.id;
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    await act(async () => {
      await result.current.createComplaint.mutateAsync({
        title: 'Second',
        description: 'Second complaint',
        category: 'food',
        priority: 'low',
        room_number: 'A-101',
        image_url: null,
      });
    });

    await waitFor(() => expect(result.current.complaints).toHaveLength(2));
    expect(result.current.complaints[0].title).toBe('Second');

    // Only admins can change status — switch session to the admin
    await act(async () => {
      localStorage.clear();
    });
    await signIn('admin@hostel.com', 'admin123');
    await act(async () => {
      await result.current.updateStatus.mutateAsync({
        id: firstId,
        status: 'resolved',
        adminNotes: 'Router restarted',
      });
    });

    await waitFor(() => {
      const resolved = getComplaints().find((c) => c.id === firstId);
      expect(resolved?.status).toBe('resolved');
    });
    const resolved = getComplaints().find((c) => c.id === firstId)!;
    expect(resolved.admin_notes).toBe('Router restarted');
    expect(resolved.resolved_at).not.toBeNull();
    expect(resolved.resolved_by).not.toBeNull();
  });

  it('updates arbitrary fields via updateComplaint and errors on unknown id', async () => {
    await signUpStudent();
    const { result } = renderHook(() => useComplaints(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.createComplaint.mutateAsync({
        title: 'Old title',
        description: 'Desc',
        category: 'cleaning',
        priority: 'medium',
        room_number: 'A-101',
        image_url: null,
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.updateComplaint.mutateAsync({ id: createdId, title: 'New title' });
    });
    await waitFor(() => expect(result.current.complaints[0].title).toBe('New title'));

    await expect(
      result.current.updateComplaint.mutateAsync({ id: 'missing-id', title: 'X' }),
    ).rejects.toThrow('Complaint not found');
  });

  it('keeps complaints stored on the fake server after mutations', async () => {
    await signUpStudent();
    const { result } = renderHook(() => useComplaints(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createComplaint.mutateAsync({
        title: 'Persisted',
        description: 'Stored on the backend',
        category: 'other',
        priority: 'urgent',
        room_number: 'A-101',
        image_url: null,
      });
    });

    expect(getComplaints()).toHaveLength(1);
    expect(getComplaints()[0].priority).toBe('urgent');
  });
});
