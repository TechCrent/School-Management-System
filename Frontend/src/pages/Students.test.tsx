import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Students } from './Students';

// Mock localStorage and mockStudents
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: () => 'admin',
      setItem: () => {},
      removeItem: () => {},
    },
    writable: true,
  });
});

describe('Students Page', () => {
  it('renders search input and filters students', async () => {
    render(<Students />);
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