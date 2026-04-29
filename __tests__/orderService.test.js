import {
  buildCreateOrderPayload,
  createOrder,
} from '../src/services/orderService';

describe('orderService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('builds a create-order payload from cart items', () => {
    const payload = buildCreateOrderPayload({
      customerName: ' Demo Customer ',
      phone: ' 0123456789 ',
      address: ' 123 Sample Street ',
      cartItems: [
        {
          product: {
            id: 'prod-001',
            name: 'Fresh Avocado',
            price: 3.49,
          },
          quantity: 2,
        },
      ],
      subtotal: 6.979,
      totalAmount: 6.979,
      deliveryFee: 0,
      addressSnapshot: {
        id: 'address-1',
        label: 'Home',
        addressLine: '123 Sample Street',
        area: 'District 1',
      },
      paymentMethodSnapshot: {
        id: 'payment-cash',
        type: 'cash',
        label: 'Cash on Delivery',
      },
    });

    expect(payload).toEqual({
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
      subtotal: 6.98,
      deliveryFee: 0,
      totalAmount: 6.98,
      deliveryAddressSnapshot: {
        id: 'address-1',
        label: 'Home',
        recipientName: 'Demo Customer',
        phoneNumber: '0123456789',
        addressLine: '123 Sample Street',
        area: 'District 1',
        notes: '',
        fullAddress: '123 Sample Street',
      },
      paymentMethodSnapshot: {
        id: 'payment-cash',
        type: 'cash',
        title: 'Cash on Delivery',
        meta: 'Pay when your groceries arrive.',
        label: 'Cash on Delivery',
        brand: '',
        last4: '',
      },
    });
  });

  it('posts a new order to the backend API', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          id: 'order-001',
          userId: 'user-001',
          status: 'pending',
          items: [],
        }),
      ),
    });

    const payload = {
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
      subtotal: 6.98,
      deliveryFee: 0,
      totalAmount: 6.98,
      deliveryAddressSnapshot: {
        id: 'address-1',
        label: 'Home',
        recipientName: 'Demo Customer',
        phoneNumber: '0123456789',
        addressLine: '123 Sample Street',
        area: 'District 1',
        notes: '',
        fullAddress: '123 Sample Street',
      },
      paymentMethodSnapshot: {
        id: 'payment-cash',
        type: 'cash',
        title: 'Cash on Delivery',
        meta: 'Pay when your groceries arrive.',
        label: 'Cash on Delivery',
        brand: '',
        last4: '',
      },
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
