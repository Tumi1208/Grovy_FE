import {
  normalizeSearchText,
  productMatchesSearch,
} from '../src/utils/search';

describe('search utils', () => {
  it('normalizes search text safely', () => {
    expect(normalizeSearchText('  Egg  ')).toBe('egg');
    expect(normalizeSearchText(500)).toBe('500');
    expect(normalizeSearchText(null)).toBe('');
    expect(normalizeSearchText(undefined)).toBe('');
  });

  it('matches product text across common searchable fields', () => {
    const product = {
      name: 'Apple Juice Family Pack',
      category: 'Beverages',
      description: 'A larger apple juice bottle for shared breakfasts.',
      unit: '1 bottle',
      size: '1L',
      imageKey: 'appleJuice',
      tags: ['fruit drink', 'breakfast'],
      keywords: ['juice', 'family'],
    };

    expect(productMatchesSearch(product, 'apple')).toBe(true);
    expect(productMatchesSearch(product, 'beverages')).toBe(true);
    expect(productMatchesSearch(product, '1l')).toBe(true);
    expect(productMatchesSearch(product, 'breakfast')).toBe(true);
    expect(productMatchesSearch(product, 'juice apple')).toBe(true);
  });

  it('matches compatibility terms like coke from imageKey aliases', () => {
    const product = {
      name: 'Classic Cola Can',
      category: 'Beverages',
      description: 'Single-serve cola can for quick refreshment.',
      imageKey: 'cokeClassic',
    };

    expect(productMatchesSearch(product, 'coke')).toBe(true);
    expect(productMatchesSearch(product, 'cola')).toBe(true);
    expect(productMatchesSearch(product, 'beef')).toBe(false);
  });
});
