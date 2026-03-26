import { formatCurrency } from '../src/utils/formatCurrency';

describe('formatCurrency', () => {
  it('formats a numeric amount into a dollar string', () => {
    expect(formatCurrency(2.99)).toBe('$2.99');
  });

  it('falls back to zero when the value is invalid', () => {
    expect(formatCurrency('invalid')).toBe('$0.00');
  });
});
