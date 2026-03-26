import { getProductById, getProducts } from '../src/services/productService';

describe('productService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns products from the backend API', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          items: [
            {
              id: 'prod-001',
              name: 'Fresh Avocado',
              slug: 'fresh-avocado',
              price: 3.49,
              image: 'https://example.com/avocado.jpg',
              category: 'Fruits',
              description: 'Fresh avocados',
              stock: 10,
            },
          ],
        }),
      ),
    });

    const products = await getProducts();

    expect(products.length).toBeGreaterThan(0);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://10.0.2.2:5050/api/v1/products',
      expect.any(Object),
    );
  });

  it('returns a product by id from the backend API', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          id: 'prod-001',
          name: 'Fresh Avocado',
          slug: 'fresh-avocado',
          price: 3.49,
          image: 'https://example.com/avocado.jpg',
          category: 'Fruits',
          description: 'Fresh avocados',
          stock: 10,
        }),
      ),
    });

    const product = await getProductById('prod-001');

    expect(product).not.toBeNull();
    expect(product.name).toBe('Fresh Avocado');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://10.0.2.2:5050/api/v1/products/prod-001',
      expect.any(Object),
    );
  });
});
