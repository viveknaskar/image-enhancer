import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransform } from '../hooks/useTransform';

describe('useTransform', () => {
  it('initialises with no rotation or flips', () => {
    const { result } = renderHook(() => useTransform());
    expect(result.current.rotation).toBe(0);
    expect(result.current.flipH).toBe(false);
    expect(result.current.flipV).toBe(false);
    expect(result.current.previewTransform).toBeUndefined();
  });

  it('rotates right in 90° increments and wraps at 360', () => {
    const { result } = renderHook(() => useTransform());
    act(() => result.current.rotateRight());
    expect(result.current.rotation).toBe(90);
    act(() => result.current.rotateRight());
    expect(result.current.rotation).toBe(180);
    act(() => result.current.rotateRight());
    expect(result.current.rotation).toBe(270);
    act(() => result.current.rotateRight());
    expect(result.current.rotation).toBe(0);
  });

  it('rotates left in 90° increments and wraps below 0', () => {
    const { result } = renderHook(() => useTransform());
    act(() => result.current.rotateLeft());
    expect(result.current.rotation).toBe(270);
    act(() => result.current.rotateLeft());
    expect(result.current.rotation).toBe(180);
  });

  it('toggles flipH on and off', () => {
    const { result } = renderHook(() => useTransform());
    act(() => result.current.toggleFlipH());
    expect(result.current.flipH).toBe(true);
    act(() => result.current.toggleFlipH());
    expect(result.current.flipH).toBe(false);
  });

  it('toggles flipV independently of flipH', () => {
    const { result } = renderHook(() => useTransform());
    act(() => result.current.toggleFlipH());
    act(() => result.current.toggleFlipV());
    expect(result.current.flipH).toBe(true);
    expect(result.current.flipV).toBe(true);
  });

  it('builds previewTransform string for rotation', () => {
    const { result } = renderHook(() => useTransform());
    act(() => result.current.rotateRight());
    expect(result.current.previewTransform).toContain('rotate(90deg)');
  });

  it('builds previewTransform string for flips', () => {
    const { result } = renderHook(() => useTransform());
    act(() => result.current.toggleFlipH());
    expect(result.current.previewTransform).toContain('scaleX(-1)');
    act(() => result.current.toggleFlipV());
    expect(result.current.previewTransform).toContain('scaleY(-1)');
  });

  it('resets rotation and flips to defaults', () => {
    const { result } = renderHook(() => useTransform());
    act(() => {
      result.current.rotateRight();
      result.current.toggleFlipH();
    });
    act(() => result.current.reset());
    expect(result.current.rotation).toBe(0);
    expect(result.current.flipH).toBe(false);
    expect(result.current.previewTransform).toBeUndefined();
  });
});
