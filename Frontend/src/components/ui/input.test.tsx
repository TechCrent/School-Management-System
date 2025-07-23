import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './input';
import React from 'react';

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('is accessible by role', () => {
    render(<Input aria-label="Test input" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
}); 