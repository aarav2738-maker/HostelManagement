import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fakeApi, resetFakeApi, seedAdmin, seedStudent, getMenu,
} from './fakeApi';

vi.mock('@/lib/api', async () => {
  const fake = await import('./fakeApi');
  return { api: fake.fakeApi, ApiError: fake.FakeApiError };
});

const App = (await import('@/App')).default;

const AUTH_KEY = 'hostel_auth_state';

// App owns its own <BrowserRouter>, so drive the URL via history directly.
const navigateTo = (path: string) => window.history.pushState({}, '', path);

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
};

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
    resetFakeApi();
    seedAdmin();
    window.scrollTo = vi.fn();
    navigateTo('/');
  });

  it('renders the landing page and opens the login modal on demand', async () => {
    renderApp();
    expect(await screen.findByText('Smart Hostel', { exact: false })).toBeInTheDocument();
    expect(screen.queryByText('Access Portal')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByText('Access Portal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows the login form on /login', async () => {
    navigateTo('/login');
    renderApp();
    expect(await screen.findByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('redirects protected routes to login when unauthenticated', async () => {
    navigateTo('/dashboard');
    renderApp();
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
  });

  it('shows the 404 page for unknown routes', async () => {
    navigateTo('/definitely-not-a-route');
    renderApp();
    expect(await screen.findByText('404')).toBeInTheDocument();
  });

  it('signs in the demo admin from the login page and lands on the admin dashboard', async () => {
    const user = userEvent.setup();
    navigateTo('/login');
    renderApp();

    await user.type(screen.getByLabelText('Email'), 'admin@hostel.com');
    await user.type(screen.getByLabelText('Password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Hostel Complaint Management')).toBeInTheDocument();
    // Persisted for the next reload
    const state = JSON.parse(localStorage.getItem(AUTH_KEY)!);
    expect(state.role).toBe('admin');
    expect(state.token).toMatch(/^token-/);
  });

  it('signs up a student, lands on the student dashboard, and greets them by name', async () => {
    const user = userEvent.setup();
    navigateTo('/signup');
    renderApp();

    await user.type(screen.getByLabelText('Full Name'), 'Priya Sharma');
    await user.type(screen.getByLabelText('Hostel ID'), 'H-01');
    await user.type(screen.getByLabelText('Room Number'), 'C-204');
    await user.type(screen.getByLabelText('Email'), 'priya@example.com');
    await user.type(screen.getByLabelText(/^Password$/), 'secret123');
    await user.type(screen.getByLabelText('Confirm Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/Welcome back, Priya/i)).toBeInTheDocument();
    const state = JSON.parse(localStorage.getItem(AUTH_KEY)!);
    expect(state.role).toBe('student');
  });

  it('redirects an already-signed-in user away from /login', async () => {
    const admin = seedAdmin();
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ token: `token-${admin.id}`, user: null, role: 'admin' }),
    );

    navigateTo('/login');
    renderApp();
    expect(await screen.findByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('blocks a student from the admin dashboard', async () => {
    const student = seedStudent();
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ token: `token-${student.id}`, user: null, role: 'student' }),
    );

    navigateTo('/admin');
    renderApp();
    // Student gets bounced to their own dashboard, not the admin one
    expect(await screen.findByText(/Welcome back, Jane/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('lets a student update their room number from the profile tab', async () => {
    const user = userEvent.setup();
    const student = seedStudent();
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ token: `token-${student.id}`, user: null, role: 'student' }),
    );

    navigateTo('/dashboard');
    renderApp();

    await user.click(await screen.findByRole('button', { name: 'Profile' }));

    const roomInput = screen.getByLabelText('Room Number');
    await user.clear(roomInput);
    await user.type(roomInput, 'B-303');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    // Live profile info reflects the change immediately
    expect(await screen.findByText('Room B-303')).toBeInTheDocument();
    const state = JSON.parse(localStorage.getItem(AUTH_KEY)!);
    expect(state.user.user_metadata.room_number).toBe('B-303');
  });

  it('lets the admin edit the mess menu and persists the change on the backend', async () => {
    const user = userEvent.setup();
    navigateTo('/login');
    renderApp();

    await user.type(screen.getByLabelText('Email'), 'admin@hostel.com');
    await user.type(screen.getByLabelText('Password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await screen.findByText('Admin Dashboard');

    await user.click(screen.getByRole('tab', { name: /mess menu/i }));

    const mondayBreakfast = screen.getByLabelText('breakfast', { selector: '#menu-Monday-breakfast' });
    await user.clear(mondayBreakfast);
    await user.type(mondayBreakfast, 'Poha Deluxe');

    await waitFor(() => expect(getMenu()[0].breakfast).toBe('Poha Deluxe'));
    expect(getMenu()).toHaveLength(7);
  });
});
