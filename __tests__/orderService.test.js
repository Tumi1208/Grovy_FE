import { createOrder } from '../src/services/orderService';

describe('orderService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('posts a new order to the backend API', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          id: 'order-001',
          customerId: 'demo-customer-1',
          status: 'pending',
        }),
      ),
    });

    const payload = {
      customerId: 'demo-customer-1',
      customerName: 'Demo Customer',
      phone: '0123456789',
      address: '123 Sample Street',
      items: [
        {
          productId: 'prod-001',
          name: 'Fresh Avocado',
          quantity: 2,
          price: 3.49,
        },
      ],
      totalAmount: 6.98,
    };

    const order = await createOrder(payload);

    expect(order.id).toBe('order-001');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://10.0.2.2:5050/api/v1/orders',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
  });
});
