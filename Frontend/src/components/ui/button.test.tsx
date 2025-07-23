import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';
import React from 'react';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('is accessible by role', () => {
    render(<Button>Accessible</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
}); 