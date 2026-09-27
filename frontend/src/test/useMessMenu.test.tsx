import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { fakeApi, resetFakeApi, getMenu, seedAdmin } from './fakeApi';

vi.mock('@/lib/api', async () => {
  const fake = await import('./fakeApi');
  return { api: fake.fakeApi, ApiError: fake.FakeApiError };
});

const { useAuth } = await import('@/hooks/useAuth');
const { useMessMenu, todayMenuIndex } = await import('@/hooks/useMessMenu');

const renderUseMessMenu = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useMessMenu(), { wrapper });
};

describe('useMessMenu', () => {
  beforeEach(() => {
    localStorage.clear();
    resetFakeApi();
    seedAdmin();
  });

  it('loads the seeded 7-day menu from the backend', async () => {
    const admin = renderHook(() => useAuth());
    await act(async () => {
      await admin.result.current.signIn('admin@hostel.com', 'admin123');
    });

    const { result } = renderUseMessMenu();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.menu).toHaveLength(7);
    expect(result.current.menu.map((d) => d.day)).toEqual([
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    ]);
    expect(result.current.menu[0].breakfast).toBe('Idli Sambar');
  });

  it('saves an edited meal to the backend and updates the query cache', async () => {
    const admin = renderHook(() => useAuth());
    await act(async () => {
      await admin.result.current.signIn('admin@hostel.com', 'admin123');
    });

    const { result } = renderUseMessMenu();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateDay.mutateAsync({
        day: 'Monday',
        field: 'breakfast',
        value: 'Poha Special',
      });
    });

    await waitFor(() => expect(result.current.menu[0].breakfast).toBe('Poha Special'));
    expect(getMenu()).toHaveLength(7);
    expect(getMenu()[0].breakfast).toBe('Poha Special');
    expect(getMenu()[1].breakfast).toBe('Poha, Jalebi');
  });

  it('maps the JS weekday to a Monday-first index', () => {
    const jsDay = new Date().getDay();
    const expected = (jsDay + 6) % 7;
    expect(todayMenuIndex()).toBe(expected);
  });
});
