import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import OrderSuccessModal from '../src/components/orders/OrderSuccessModal';
import PrimaryButton from '../src/components/PrimaryButton';

function getNodeText(node) {
  if (typeof node === 'string') {
    return node;
  }

  if (!node || !node.children) {
    return '';
  }

  return node.children.map(getNodeText).join(' ');
}

function findTextNodes(root, text) {
  return root.findAll(
    node => node.type === Text && getNodeText(node).includes(text),
  );
}

describe('OrderSuccessModal', () => {
  let renderer = null;

  afterEach(() => {
    if (renderer) {
      act(() => {
        renderer.unmount();
      });
      renderer = null;
    }
  });

  it('renders the polished success popup content in screen mode', () => {
    act(() => {
      renderer = TestRenderer.create(
        <OrderSuccessModal
          onBackToHome={jest.fn()}
          onExploreSmartBaskets={jest.fn()}
          onSaveBasket={jest.fn()}
          onTrackOrder={jest.fn()}
          order={{
            id: 'order-123456789',
            items: [
              { quantity: 2 },
              { quantity: 1 },
            ],
            status: 'processing',
            totalAmount: 15.75,
          }}
          presentation="screen"
        />,
      );
    });

    expect(
      findTextNodes(renderer.root, 'Your order has been accepted'),
    ).not.toHaveLength(0);
    expect(
      findTextNodes(renderer.root, "We're getting your groceries ready now."),
    ).not.toHaveLength(0);
    expect(findTextNodes(renderer.root, 'Order details')).not.toHaveLength(0);
    expect(findTextNodes(renderer.root, 'Reference')).not.toHaveLength(0);
    expect(findTextNodes(renderer.root, 'Item count')).not.toHaveLength(0);
    expect(findTextNodes(renderer.root, 'Total')).not.toHaveLength(0);
    expect(findTextNodes(renderer.root, 'Status')).not.toHaveLength(0);
    expect(
      findTextNodes(renderer.root, 'Explore Smart Baskets'),
    ).not.toHaveLength(0);
    expect(findTextNodes(renderer.root, 'Save this basket')).not.toHaveLength(0);
    expect(
      findTextNodes(renderer.root, 'Buy similar basket again'),
    ).toHaveLength(0);
    expect(findTextNodes(renderer.root, 'Calendar')).toHaveLength(0);

    const buttons = renderer.root.findAllByType(PrimaryButton);

    expect(buttons.map(button => button.props.title)).toEqual([
      'Back to Home',
      'Track Order',
    ]);
    expect(buttons.map(button => button.props.variant || 'primary')).toEqual([
      'primary',
      'secondary',
    ]);
  });
});
