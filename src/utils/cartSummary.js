function getCartEntries(cartState) {
  if (Array.isArray(cartState)) {
    return cartState.filter(Boolean);
  }

  if (cartState && typeof cartState === 'object') {
    return Object.values(cartState).filter(Boolean);
  }

  return [];
}

function getItemQuantity(item) {
  const rawQuantity =
    item?.quantity ?? item?.qty ?? item?.count ?? item?.amount ?? 1;
  const quantity = Math.floor(Number(rawQuantity));

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 1;
  }

  return quantity;
}

function getItemUnitPrice(item) {
  const rawPrice = item?.product?.price ?? item?.price ?? 0;
  const price = Number(rawPrice);

  if (!Number.isFinite(price) || price < 0) {
    return 0;
  }

  return price;
}

export function getCartSummary(cartState) {
  return getCartEntries(cartState).reduce(
    (summary, item) => {
      const quantity = getItemQuantity(item);
      const unitPrice = getItemUnitPrice(item);

      return {
        totalItems: summary.totalItems + quantity,
        totalPrice: summary.totalPrice + unitPrice * quantity,
      };
    },
    {
      totalItems: 0,
      totalPrice: 0,
    },
  );
}

export default getCartSummary;
