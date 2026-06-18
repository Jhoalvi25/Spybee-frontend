import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formatea fecha válida correctamente', () => {
    const result = formatDate('2025-06-17T10:30:00.000Z');
    expect(result).toContain('17-06-2025');
    expect(result).toContain('10:30');
  });

  it('formatea otra fecha correctamente', () => {
    const result = formatDate('2025-01-05T03:00:00.000Z');
    expect(result).toContain('05-01-2025');
    expect(result).toContain('3:00');
  });

  it('retorna — para fecha inválida', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('retorna — para string vacío', () => {
    expect(formatDate('')).toBe('—');
  });

  it('retorna — para string con espacios', () => {
    expect(formatDate('   ')).toBe('—');
  });

  it('usa formato español DD-MM-YYYY', () => {
    const result = formatDate('2025-03-04T12:00:00.000Z');
    expect(result).toMatch(/^\d{2}-\d{2}-\d{4}/);
  });
});
