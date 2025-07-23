import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './alert';
import React from 'react';

describe('Alert', () => {
  it('renders with children', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('has role alert for accessibility', () => {
    render(<Alert>Alert a11y</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
}); 