import { DEMO_PRODUCTS } from '../src/data/demoProducts';
import {
  RecipeBaskets,
  SmartBaskets,
} from '../src/data/smartShoppingData';
import {
  buildBudgetBasket,
  calculateCartHealth,
  findProductBySmartKey,
  normalizeText,
  resolveSmartBasketProducts,
} from '../src/utils/smartShoppingHelpers';

describe('smartShoppingHelpers', () => {
  it('normalizes text safely for matching', () => {
    expect(normalizeText('  Apple Juice  ')).toBe('apple juice');
    expect(normalizeText(12)).toBe('12');
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });

  it('finds products by slug, image key, and fallback name/category matching', () => {
    expect(findProductBySmartKey(DEMO_PRODUCTS, 'egg-noodles')?.id).toBe(
      'grovy-egg-noodles-001',
    );
    expect(findProductBySmartKey(DEMO_PRODUCTS, 'appleJuice')?.imageKey).toBe(
      'appleJuice',
    );
    expect(findProductBySmartKey(DEMO_PRODUCTS, 'eggs')?.category).toBe(
      'Dairy and Eggs',
    );
    expect(findProductBySmartKey(DEMO_PRODUCTS, 'vegetables')?.category).toBe(
      'Vegetables',
    );
  });

  it('resolves configured smart baskets against existing products', () => {
    const weeklyBasket = resolveSmartBasketProducts(
      DEMO_PRODUCTS,
      SmartBaskets.weeklyFreshBasket,
    );
    const recipeBasket = resolveSmartBasketProducts(
      DEMO_PRODUCTS,
      RecipeBaskets.eggNoodlesMeal,
    );

    expect(weeklyBasket.products).toHaveLength(6);
    expect(weeklyBasket.missingKeys).toEqual([]);
    expect(recipeBasket.products.map(product => product.id)).toEqual(
      expect.arrayContaining([
        'grovy-egg-noodles-001',
        'grovy-ginger-001',
        'grovy-chicken-001',
      ]),
    );
  });

  it('builds a simple basket under budget with category variety', () => {
    const budgetBasket = buildBudgetBasket(DEMO_PRODUCTS, 10);
    const categories = budgetBasket.products.map(product => product.category);

    expect(budgetBasket.estimatedTotal).toBeLessThanOrEqual(10);
    expect(categories).toEqual(expect.arrayContaining(['Fruits', 'Pantry']));
    expect(
      categories.some(category => ['Meat', 'Dairy and Eggs'].includes(category)),
    ).toBe(true);
  });

  it('scores mixed cart shapes and returns health suggestions', () => {
    const cartHealth = calculateCartHealth([
      { product: DEMO_PRODUCTS.find(product => product.id === 'grovy-apple-001') },
      {
        product: DEMO_PRODUCTS.find(product => product.id === 'grovy-rice-001'),
        quantity: 2,
      },
      { product: DEMO_PRODUCTS.find(product => product.id === 'grovy-chicken-001') },
      DEMO_PRODUCTS.find(product => product.id === 'grovy-classic-cola-001'),
    ]);

    expect(cartHealth.score).toBe(70);
    expect(cartHealth.label).toBe('Good start');
    expect(cartHealth.positives).toEqual(
      expect.arrayContaining([
        'Includes fruit for easy snacks and breakfast.',
        'Includes pantry basics for daily meals.',
      ]),
    );
    expect(cartHealth.suggestions).toContain(
      'Add vegetables for color and meal balance.',
    );
  });
});
