import { describe, it, expect } from 'vitest';
import { buildFilterString } from '../hooks/useFilters';
import { FILTER_DEFAULTS } from '../types';

describe('buildFilterString', () => {
  it('produces the default filter string with no visible effects', () => {
    const result = buildFilterString(FILTER_DEFAULTS);
    expect(result).toContain('brightness(100%)');
    expect(result).toContain('contrast(100%)');
    expect(result).toContain('saturate(100%)');
    expect(result).toContain('sepia(0%)');
    expect(result).toContain('grayscale(0%)');
    expect(result).toContain('blur(0px)');
    expect(result).not.toContain('url('); // no sharpen SVG at default
  });

  it('includes sharpen SVG filter when sharpen > 0', () => {
    const result = buildFilterString({ ...FILTER_DEFAULTS, sharpen: 0.5 });
    expect(result).toContain('url(');
    expect(result).toContain('#sharpen');
  });

  it('omits sharpen SVG filter when sharpen is 0', () => {
    const result = buildFilterString({ ...FILTER_DEFAULTS, sharpen: 0 });
    expect(result).not.toContain('url(');
  });

  it('reflects custom brightness and contrast values', () => {
    const result = buildFilterString({ ...FILTER_DEFAULTS, brightness: 150, contrast: 80 });
    expect(result).toContain('brightness(150%)');
    expect(result).toContain('contrast(80%)');
  });

  it('reflects blur in pixels', () => {
    const result = buildFilterString({ ...FILTER_DEFAULTS, blur: 4 });
    expect(result).toContain('blur(4px)');
  });
});
