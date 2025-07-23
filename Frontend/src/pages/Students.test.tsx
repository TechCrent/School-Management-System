import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Students } from './Students';
import '../i18n';
import { NotificationProvider } from '../components/layout/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// Set the role to admin for the test environment
beforeAll(() => {
  window.localStorage.setItem('role', 'admin');
});

describe('Students Page', () => {
  it('renders search input and filters students', async () => {
    const queryClient = new QueryClient();
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <Students />
          </NotificationProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search students by name/i)).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText(/search students by name/i);
    expect(searchInput).toBeInTheDocument();

    // Wait for students to load
    await waitFor(() => expect(screen.getByText(/students/i)).toBeInTheDocument());

    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'john' } });
    // Wait for debounce
    await waitFor(() => {
      expect(screen.getAllByText(/john/i).length).toBeGreaterThan(0);
    });
  });
}); 