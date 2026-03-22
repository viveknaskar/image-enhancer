import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SliderRow } from '../components/SliderRow';

describe('SliderRow', () => {
  it('renders the label and value badge', () => {
    render(<SliderRow label="Brightness" value={100} displayValue="100%" min={0} max={200} onChange={() => {}} />);
    expect(screen.getByText('Brightness')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders the range input with correct attributes', () => {
    render(<SliderRow label="Blur" value={5} displayValue="5px" min={0} max={10} step={0.1} onChange={() => {}} />);
    const input = screen.getByRole('slider', { name: 'Blur' });
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '10');
    expect(input).toHaveAttribute('step', '0.1');
    expect(input).toHaveValue('5');
  });

  it('calls onChange when the slider value changes', () => {
    const onChange = vi.fn();
    render(<SliderRow label="Contrast" value={100} displayValue="100%" min={0} max={200} onChange={onChange} />);
    const input = screen.getByRole('slider', { name: 'Contrast' });
    fireEvent.change(input, { target: { value: '120' } });
    expect(onChange).toHaveBeenCalledWith(120);
  });

  it('reset button is not present without a defaultValue prop', () => {
    render(<SliderRow label="Sepia" value={50} displayValue="50%" min={0} max={100} onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /reset sepia/i })).not.toBeInTheDocument();
  });

  it('reset button has pointer-events-none when value equals defaultValue', () => {
    render(<SliderRow label="Brightness" value={100} displayValue="100%" min={0} max={200} defaultValue={100} onChange={() => {}} />);
    const btn = screen.getByRole('button', { name: /reset brightness/i });
    expect(btn).toHaveClass('pointer-events-none');
  });

  it('reset button has group-hover class when value differs from defaultValue', () => {
    render(<SliderRow label="Brightness" value={150} displayValue="150%" min={0} max={200} defaultValue={100} onChange={() => {}} />);
    const btn = screen.getByRole('button', { name: /reset brightness/i });
    expect(btn).toHaveClass('group-hover:opacity-100');
    expect(btn).not.toHaveClass('pointer-events-none');
  });

  it('clicking the reset button calls onChange with the defaultValue', async () => {
    const onChange = vi.fn();
    render(<SliderRow label="Brightness" value={150} displayValue="150%" min={0} max={200} defaultValue={100} onChange={onChange} />);
    const btn = screen.getByRole('button', { name: /reset brightness/i });
    await userEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(100);
  });
});
