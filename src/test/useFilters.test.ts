import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../hooks/useFilters';
import { FILTER_DEFAULTS } from '../types';

describe('useFilters', () => {
  it('initialises with default values', () => {
    const { result } = renderHook(() => useFilters());
    expect(result.current.filters).toEqual(FILTER_DEFAULTS);
  });

  it('updates a single filter without touching others', () => {
    const { result } = renderHook(() => useFilters());
    act(() => { result.current.setFilter('brightness', 150); });
    expect(result.current.filters.brightness).toBe(150);
    expect(result.current.filters.contrast).toBe(FILTER_DEFAULTS.contrast);
  });

  it('resets all filters back to defaults', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.setFilter('brightness', 50);
      result.current.setFilter('blur', 5);
    });
    act(() => { result.current.reset(); });
    expect(result.current.filters).toEqual(FILTER_DEFAULTS);
  });

  it('exposes a non-empty filterString', () => {
    const { result } = renderHook(() => useFilters());
    expect(result.current.filterString.length).toBeGreaterThan(0);
  });

  it('updates filterString when a filter changes', () => {
    const { result } = renderHook(() => useFilters());
    const before = result.current.filterString;
    act(() => { result.current.setFilter('sepia', 80); });
    expect(result.current.filterString).not.toBe(before);
    expect(result.current.filterString).toContain('sepia(80%)');
  });
});
