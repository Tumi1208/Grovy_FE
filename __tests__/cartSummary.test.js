import { getCartSummary } from '../src/utils/cartSummary';

describe('getCartSummary', () => {
  it('calculates totals for the current cart item shape', () => {
    expect(
      getCartSummary([
        {
          product: { id: 'apple', price: 2 },
          quantity: 3,
        },
        {
          product: { id: 'banana', price: 1.5 },
          quantity: 2,
        },
      ]),
    ).toEqual({
      totalItems: 5,
      totalPrice: 9,
    });
  });

  it('supports object cart shapes and alternate quantity fields', () => {
    expect(
      getCartSummary({
        apple: { id: 'apple', price: 2, qty: 2 },
        banana: { id: 'banana', price: 1.5, count: 3 },
        orange: { id: 'orange', price: 4, amount: 1 },
      }),
    ).toEqual({
      totalItems: 6,
      totalPrice: 12.5,
    });
  });

  it('handles malformed entries without crashing', () => {
    expect(
      getCartSummary([
        null,
        undefined,
        {},
        {
          product: { id: 'apple', price: 'bad' },
          quantity: 'bad',
        },
      ]),
    ).toEqual({
      totalItems: 2,
      totalPrice: 0,
    });
  });
});
