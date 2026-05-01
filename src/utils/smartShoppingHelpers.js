function splitCamelCase(value = '') {
  return String(value).replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

export function normalizeText(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim().toLowerCase();
  }

  return '';
}

function normalizeLookupText(value) {
  return normalizeText(splitCamelCase(value))
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeLookupKey(value) {
  return normalizeLookupText(value).replace(/\s+/g, '');
}

function getProductPrice(product = {}) {
  const price = Number(product.price);

  if (!Number.isFinite(price) || price < 0) {
    return 0;
  }

  return price;
}

function normalizeBudget(value) {
  const budget = Number(value);

  if (!Number.isFinite(budget) || budget <= 0) {
    return 0;
  }

  return budget;
}

function getCartEntries(cartItems) {
  if (Array.isArray(cartItems)) {
    return cartItems.filter(Boolean);
  }

  if (cartItems && typeof cartItems === 'object') {
    return Object.values(cartItems).filter(Boolean);
  }

  return [];
}

function getCartQuantity(item) {
  const rawQuantity = item?.quantity ?? item?.qty ?? item?.count;

  if (rawQuantity == null) {
    return 1;
  }

  const quantity = Math.floor(Number(rawQuantity));

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 0;
  }

  return quantity;
}

function getCartProduct(item) {
  if (item?.product && typeof item.product === 'object') {
    return item.product;
  }

  return item && typeof item === 'object' ? item : null;
}

function getProductSearchText(product = {}) {
  return [
    product.id,
    product.slug,
    product.imageKey,
    product.name,
    product.category,
  ]
    .map(normalizeLookupText)
    .filter(Boolean)
    .join(' ');
}

function getProductTokens(product = {}) {
  return new Set(getProductSearchText(product).split(/\s+/).filter(Boolean));
}

function isFruitProduct(product = {}) {
  const categoryText = normalizeLookupText(product.category);
  const tokens = getProductTokens(product);

  return (
    categoryText.includes('fruit') ||
    tokens.has('fruit') ||
    tokens.has('fruits') ||
    tokens.has('apple') ||
    tokens.has('banana')
  );
}

function isVegetableProduct(product = {}) {
  const categoryText = normalizeLookupText(product.category);
  const tokens = getProductTokens(product);

  return (
    categoryText.includes('vegetable') ||
    tokens.has('vegetable') ||
    tokens.has('vegetables') ||
    tokens.has('ginger') ||
    tokens.has('shimla') ||
    tokens.has('pepper') ||
    tokens.has('capsicum')
  );
}

function isPantryProduct(product = {}) {
  const categoryText = normalizeLookupText(product.category);
  const tokens = getProductTokens(product);

  return (
    categoryText.includes('pantry') ||
    tokens.has('pantry') ||
    tokens.has('rice') ||
    tokens.has('noodles') ||
    tokens.has('pasta') ||
    tokens.has('lentils') ||
    tokens.has('chickpeas') ||
    tokens.has('pulses') ||
    tokens.has('oil') ||
    tokens.has('mayonnaise')
  );
}

function isProteinProduct(product = {}) {
  const categoryText = normalizeLookupText(product.category);
  const tokens = getProductTokens(product);

  return (
    categoryText.includes('meat') ||
    categoryText.includes('dairy and eggs') ||
    categoryText.includes('dairy') ||
    tokens.has('chicken') ||
    tokens.has('beef') ||
    tokens.has('eggs')
  );
}

function isBeverageOrDairyProduct(product = {}) {
  const categoryText = normalizeLookupText(product.category);
  const tokens = getProductTokens(product);

  return (
    categoryText.includes('beverage') ||
    categoryText.includes('dairy') ||
    tokens.has('beverages') ||
    tokens.has('beverage') ||
    tokens.has('dairy') ||
    tokens.has('juice') ||
    tokens.has('cola') ||
    tokens.has('soda') ||
    tokens.has('drink') ||
    tokens.has('pepsi') ||
    tokens.has('sprite')
  );
}

function getProductGroups(product = {}) {
  const groups = [];

  if (isFruitProduct(product)) {
    groups.push('fruit');
  }

  if (isVegetableProduct(product)) {
    groups.push('vegetable');
  }

  if (isPantryProduct(product)) {
    groups.push('pantry');
  }

  if (isProteinProduct(product)) {
    groups.push('protein');
  }

  if (isBeverageOrDairyProduct(product)) {
    groups.push('beverageOrDairy');
  }

  return groups;
}

function findProductByField(products = [], fieldName, normalizedKey) {
  return (
    products.find(
      product => normalizeLookupKey(product?.[fieldName]) === normalizedKey,
    ) || null
  );
}

function getSmartBasketKeys(smartBasket = {}) {
  if (Array.isArray(smartBasket.productKeys)) {
    return smartBasket.productKeys;
  }

  if (Array.isArray(smartBasket.productSlugs)) {
    return smartBasket.productSlugs;
  }

  return [];
}

function selectBudgetProduct(selection, product) {
  selection.products.push(product);
  selection.productIds.add(product.id);
  getProductGroups(product).forEach(group => selection.groups.add(group));
  selection.estimatedTotal += getProductPrice(product);
}

function getAffordableCandidates(products = [], remainingBudget, productIds) {
  return products
    .filter(product => {
      const productId = product?.id;

      return (
        productId &&
        !productIds.has(productId) &&
        getProductPrice(product) > 0 &&
        getProductPrice(product) <= remainingBudget
      );
    })
    .sort((left, right) => getProductPrice(left) - getProductPrice(right));
}

function getUnrepresentedGroupCount(product, selectedGroups) {
  return getProductGroups(product).filter(group => !selectedGroups.has(group))
    .length;
}

export function findProductBySmartKey(products = [], key) {
  const productList = Array.isArray(products) ? products.filter(Boolean) : [];
  const normalizedKey = normalizeLookupKey(key);
  const normalizedTextKey = normalizeLookupText(key);

  if (!normalizedKey) {
    return null;
  }

  return (
    findProductByField(productList, 'slug', normalizedKey) ||
    findProductByField(productList, 'imageKey', normalizedKey) ||
    productList.find(product => {
      const normalizedName = normalizeLookupText(product?.name);

      return Boolean(
        normalizedName &&
          (normalizedName.includes(normalizedTextKey) ||
            normalizeLookupKey(product?.name).includes(normalizedKey)),
      );
    }) ||
    productList.find(product => {
      const combinedText = getProductSearchText(product);

      return Boolean(
        combinedText &&
          (combinedText.includes(normalizedTextKey) ||
            normalizeLookupKey(combinedText).includes(normalizedKey)),
      );
    }) ||
    null
  );
}

export function resolveSmartBasketProducts(products = [], smartBasket = {}) {
  const resolvedProducts = [];
  const missingKeys = [];
  const seenProductIds = new Set();

  getSmartBasketKeys(smartBasket).forEach(key => {
    const product = findProductBySmartKey(products, key);

    if (!product) {
      missingKeys.push(key);
      return;
    }

    if (seenProductIds.has(product.id)) {
      return;
    }

    seenProductIds.add(product.id);
    resolvedProducts.push(product);
  });

  return {
    products: resolvedProducts,
    missingKeys,
  };
}

export function buildBudgetBasket(products = [], budget) {
  const normalizedBudget = normalizeBudget(budget);
  const productList = Array.isArray(products) ? products.filter(Boolean) : [];
  const selection = {
    products: [],
    productIds: new Set(),
    groups: new Set(),
    estimatedTotal: 0,
  };

  if (!normalizedBudget || !productList.length) {
    return {
      products: [],
      estimatedTotal: 0,
    };
  }

  ['fruit', 'pantry', 'protein', 'beverageOrDairy'].forEach(group => {
    const remainingBudget = normalizedBudget - selection.estimatedTotal;
    const affordableCandidates = getAffordableCandidates(
      productList,
      remainingBudget,
      selection.productIds,
    );
    const candidate = affordableCandidates.find(product =>
      getProductGroups(product).includes(group),
    );

    if (candidate) {
      selectBudgetProduct(selection, candidate);
    }
  });

  while (selection.estimatedTotal < normalizedBudget) {
    const remainingBudget = normalizedBudget - selection.estimatedTotal;
    const affordableCandidates = getAffordableCandidates(
      productList,
      remainingBudget,
      selection.productIds,
    );

    if (!affordableCandidates.length) {
      break;
    }

    affordableCandidates.sort((left, right) => {
      const rightVarietyBoost = getUnrepresentedGroupCount(right, selection.groups);
      const leftVarietyBoost = getUnrepresentedGroupCount(left, selection.groups);

      if (rightVarietyBoost !== leftVarietyBoost) {
        return rightVarietyBoost - leftVarietyBoost;
      }

      return getProductPrice(left) - getProductPrice(right);
    });

    selectBudgetProduct(selection, affordableCandidates[0]);
  }

  return {
    products: selection.products,
    estimatedTotal: Number(selection.estimatedTotal.toFixed(2)),
  };
}

export function calculateCartHealth(cartItems) {
  const cartProducts = getCartEntries(cartItems)
    .filter(item => getCartQuantity(item) > 0)
    .map(getCartProduct)
    .filter(Boolean);

  const hasFruit = cartProducts.some(isFruitProduct);
  const hasVegetables = cartProducts.some(isVegetableProduct);
  const hasProtein = cartProducts.some(isProteinProduct);
  const hasPantry = cartProducts.some(isPantryProduct);
  const hasBeverageOrDairy = cartProducts.some(isBeverageOrDairyProduct);

  const score = Math.min(
    100,
    (hasFruit ? 20 : 0) +
      (hasVegetables ? 20 : 0) +
      (hasProtein ? 20 : 0) +
      (hasPantry ? 20 : 0) +
      (hasBeverageOrDairy ? 10 : 0),
  );

  const positives = [];
  const suggestions = [];

  if (hasFruit) {
    positives.push('Includes fruit for easy snacks and breakfast.');
  } else {
    suggestions.push('Add fruit for quick snacks.');
  }

  if (hasVegetables) {
    positives.push('Includes vegetables for cooking variety.');
  } else {
    suggestions.push('Add vegetables for color and meal balance.');
  }

  if (hasProtein) {
    positives.push('Includes protein for more filling meals.');
  } else {
    suggestions.push('Add eggs, chicken, or beef for protein.');
  }

  if (hasPantry) {
    positives.push('Includes pantry basics for daily meals.');
  } else {
    suggestions.push('Add rice, noodles, or pulses for daily meals.');
  }

  if (hasBeverageOrDairy) {
    positives.push('Includes beverage or dairy support items.');
  } else {
    suggestions.push('Add juice or dairy for breakfast pairings.');
  }

  return {
    score,
    label: score >= 80 ? 'Balanced basket' : score >= 50 ? 'Good start' : 'Needs variety',
    positives,
    suggestions,
  };
}

export const NormalizeText = normalizeText;
export const FindProductBySmartKey = findProductBySmartKey;
export const ResolveSmartBasketProducts = resolveSmartBasketProducts;
export const BuildBudgetBasket = buildBudgetBasket;
export const CalculateCartHealth = calculateCartHealth;
