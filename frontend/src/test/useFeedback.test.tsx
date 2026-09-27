import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { fakeApi, resetFakeApi, getFeedback, seedStudent, resolveComplaint } from './fakeApi';

vi.mock('@/lib/api', async () => {
  const fake = await import('./fakeApi');
  return { api: fake.fakeApi, ApiError: fake.FakeApiError };
});

const { useAuth } = await import('@/hooks/useAuth');
const { useFeedback } = await import('@/hooks/useFeedback');
const { useComplaints } = await import('@/hooks/useComplaints');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useFeedback', () => {
  beforeEach(() => {
    localStorage.clear();
    resetFakeApi();
  });

  it('creates feedback tied to the current user and finds it by complaint', async () => {
    const student = seedStudent();
    const auth = renderHook(() => useAuth());
    await act(async () => {
      await auth.result.current.signIn(student.email, student.password);
    });

    const complaints = renderHook(() => useComplaints(), { wrapper: createWrapper() });
    let complaintId = '';
    await act(async () => {
      const created = await complaints.result.current.createComplaint.mutateAsync({
        title: 'Broken chair',
        description: 'Chair leg snapped.',
        category: 'furniture',
        priority: 'low',
        room_number: 'A-101',
        image_url: null,
      });
      complaintId = created.id;
    });
    resolveComplaint(complaintId);

    const { result } = renderHook(() => useFeedback(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.getFeedbackForComplaint(complaintId)).toBeUndefined();

    await act(async () => {
      await result.current.createFeedback.mutateAsync({
        complaint_id: complaintId,
        rating: 4,
        comment: 'Fixed quickly, thanks!',
      });
    });

    await waitFor(() => expect(result.current.feedback).toHaveLength(1));
    const found = result.current.getFeedbackForComplaint(complaintId);
    expect(found).toBeDefined();
    expect(found?.rating).toBe(4);
    expect(found?.comment).toBe('Fixed quickly, thanks!');
    expect(found?.user_id).toBe(student.id);
    expect(getFeedback()).toHaveLength(1);
  });

  it('rejects feedback on unresolved complaints', async () => {
    const student = seedStudent();
    const auth = renderHook(() => useAuth());
    await act(async () => {
      await auth.result.current.signIn(student.email, student.password);
    });

    const complaints = renderHook(() => useComplaints(), { wrapper: createWrapper() });
    let complaintId = '';
    await act(async () => {
      const created = await complaints.result.current.createComplaint.mutateAsync({
        title: 'Still broken',
        description: 'Not fixed yet.',
        category: 'wifi',
        priority: 'high',
        room_number: 'A-101',
        image_url: null,
      });
      complaintId = created.id;
    });

    const { result } = renderHook(() => useFeedback(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      result.current.createFeedback.mutateAsync({
        complaint_id: complaintId,
        rating: 5,
        comment: null,
      }),
    ).rejects.toThrow('Feedback can only be given on resolved complaints');
  });
});
