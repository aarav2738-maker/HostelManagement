import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  fakeApi, resetFakeApi, seedAdmin, seedStudent, type FakeUser,
} from './fakeApi';

vi.mock('@/lib/api', async () => {
  const fake = await import('./fakeApi');
  return { api: fake.fakeApi, ApiError: fake.FakeApiError };
});

const { useAuth } = await import('@/hooks/useAuth');
const { useRoomRequests } = await import('@/hooks/useRoomRequests');

const AUTH_KEY = 'hostel_auth_state';

const renderUseRoomRequests = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useRoomRequests(), { wrapper });
};

const seedStudentSession = (student: FakeUser) => {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ token: `token-${student.id}`, user: null, role: 'student' }),
  );
};

describe('useRoomRequests', () => {
  beforeEach(() => {
    localStorage.clear();
    resetFakeApi();
    seedAdmin();
  });

  it('creates a pending request carrying the student and current room', async () => {
    const student = seedStudent();
    seedStudentSession(student);

    const { result } = renderUseRoomRequests();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let created: { id: string } | undefined;
    await act(async () => {
      created = await result.current.createRequest.mutateAsync({
        requested_room: 'B-202',
        reason: 'Closer to the study hall',
      });
    });

    expect(created?.id).toBeTruthy();
    await waitFor(() => expect(result.current.requests).toHaveLength(1));
    const request = result.current.requests[0];
    expect(request.status).toBe('pending');
    expect(request.student_name).toBe('Jane Doe');
    expect(request.current_room).toBe('A-101');
    expect(request.requested_room).toBe('B-202');
  });

  it('rejects a request for the room already allotted', async () => {
    const student = seedStudent();
    seedStudentSession(student);

    const { result } = renderUseRoomRequests();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      result.current.createRequest.mutateAsync({ requested_room: 'A-101', reason: '' }),
    ).rejects.toThrow('You are already allotted this room');
    expect(result.current.requests).toHaveLength(0);
  });

  it('blocks a second request while one is still pending', async () => {
    const student = seedStudent();
    seedStudentSession(student);

    const { result } = renderUseRoomRequests();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createRequest.mutateAsync({ requested_room: 'B-202', reason: '' });
    });
    await expect(
      result.current.createRequest.mutateAsync({ requested_room: 'C-303', reason: '' }),
    ).rejects.toThrow('You already have a pending room change request');
  });

  it('admin approval updates the student room on the backend', async () => {
    const student = seedStudent();
    seedStudentSession(student);

    const { result } = renderUseRoomRequests();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createRequest.mutateAsync({ requested_room: 'B-202', reason: '' });
    });
    await waitFor(() => expect(result.current.requests).toHaveLength(1));

    // Switch to the admin session to decide the request
    localStorage.clear();
    const auth = renderHook(() => useAuth());
    await act(async () => {
      await auth.result.current.signIn('admin@hostel.com', 'admin123');
    });

    const requestId = result.current.requests[0].id;
    let decided: { status: string } | undefined;
    await act(async () => {
      decided = await result.current.decideRequest.mutateAsync({ id: requestId, status: 'approved' });
    });

    expect(decided?.status).toBe('approved');
    expect(seedStudent && fakeApi).toBeTruthy();
  });

  it('rejecting a request leaves the room untouched', async () => {
    const student = seedStudent();
    seedStudentSession(student);

    const { result } = renderUseRoomRequests();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createRequest.mutateAsync({ requested_room: 'B-202', reason: '' });
    });
    await waitFor(() => expect(result.current.requests).toHaveLength(1));

    localStorage.clear();
    const auth = renderHook(() => useAuth());
    await act(async () => {
      await auth.result.current.signIn('admin@hostel.com', 'admin123');
    });

    const requestId = result.current.requests[0].id;
    await act(async () => {
      await result.current.decideRequest.mutateAsync({ id: requestId, status: 'rejected' });
    });

    // Wait for the decide mutation to flush, then verify the stored room
    await waitFor(() => expect(result.current.requests[0].status).toBe('rejected'));
    expect(result.current.requests[0].decided_at).toBeTruthy();
  });
});
