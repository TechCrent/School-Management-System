import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './use-toast';

describe('useToast', () => {
  it('can add and dismiss a toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'Test Toast' });
    });
    expect(result.current.toasts.length).toBeGreaterThan(0);
    const toastId = result.current.toasts[0].id;
    act(() => {
      result.current.dismiss(toastId);
    });
    expect(result.current.toasts[0].open).toBe(false);
  });
}); 