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
              imageKey: 'avocado',
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

    expect(products).toEqual([
      {
        id: 'prod-001',
        name: 'Fresh Avocado',
        slug: 'fresh-avocado',
        price: 3.49,
        category: 'Fruits',
        description: 'Fresh avocados',
        unit: '',
        size: '',
        tags: [],
        keywords: [],
        stock: 10,
        imageKey: 'avocado',
        image: 'https://example.com/avocado.jpg',
      },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://10.0.2.2:5050/api/v1/products',
      expect.any(Object),
    );
  });

  it('normalizes product fields from the backend API', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          items: [
            {
              name: 'Organic Bananas',
              price: '-2.19',
              stock: '-60',
            },
          ],
        }),
      ),
    });

    const [product] = await getProducts();

    expect(product).toEqual({
      id: 'organic-bananas',
      name: 'Organic Bananas',
      slug: 'organic-bananas',
      price: 0,
      category: 'Uncategorized',
      description: 'No description available yet.',
      unit: '',
      size: '',
      tags: [],
      keywords: [],
      stock: 0,
      imageKey: '',
      image: '',
    });
  });

  it('reuses a local legacy image value as imageKey when needed', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          items: [
            {
              id: 'prod-002',
              name: 'Pantry Pasta',
              image: 'pasta',
            },
          ],
        }),
      ),
    });

    const [product] = await getProducts();

    expect(product.imageKey).toBe('pasta');
    expect(product.image).toBe('pasta');
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
          imageKey: 'avocado',
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
    expect(product.imageKey).toBe('avocado');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://10.0.2.2:5050/api/v1/products/prod-001',
      expect.any(Object),
    );
  });

  it('throws a clear error when a product id is missing', async () => {
    await expect(getProductById()).rejects.toThrow(
      'A product id is required to load product details.',
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
