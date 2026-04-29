import { normalizeProduct } from '../utils/normalizeProduct';

function createDemoProduct(product) {
  return normalizeProduct(product);
}

export const DEMO_PRODUCTS = Object.freeze(
  [
    // Fruits
    {
      id: 'grovy-apple-001',
      name: 'Crisp Apple',
      slug: 'crisp-apple',
      price: 1.29,
      category: 'Fruits',
      description:
        'Sweet and crunchy apples for snacks, lunch boxes, and salads.',
      stock: 34,
      imageKey: 'apple',
    },
    {
      id: 'grovy-apple-gala-001',
      name: 'Gala Apples Bag',
      slug: 'gala-apples-bag',
      price: 1.59,
      category: 'Fruits',
      description:
        'A mellow and juicy apple bag that works well for breakfast and lunchbox fruit.',
      stock: 28,
      imageKey: 'apple',
    },
    {
      id: 'grovy-apple-fuji-001',
      name: 'Fuji Apples Pack',
      slug: 'fuji-apples-pack',
      price: 1.79,
      category: 'Fruits',
      description:
        'Crisp Fuji apples with balanced sweetness for everyday snacking and sharing.',
      stock: 25,
      imageKey: 'apple',
    },
    {
      id: 'grovy-banana-001',
      name: 'Sweet Banana Bunch',
      slug: 'sweet-banana-bunch',
      price: 1.09,
      category: 'Fruits',
      description:
        'Ripe bananas that work well for breakfast bowls, smoothies, and quick snacks.',
      stock: 41,
      imageKey: 'banana',
    },
    {
      id: 'grovy-banana-organic-001',
      name: 'Organic Banana Bunch',
      slug: 'organic-banana-bunch',
      price: 1.29,
      category: 'Fruits',
      description:
        'A soft organic banana bunch suited for smoothies, oats, and easy family snacks.',
      stock: 29,
      imageKey: 'banana',
    },
    {
      id: 'grovy-mini-bananas-001',
      name: 'Mini Banana Pack',
      slug: 'mini-banana-pack',
      price: 1.49,
      category: 'Fruits',
      description:
        'Small sweet bananas for snack boxes, quick bites, and on-the-go fruit packs.',
      stock: 24,
      imageKey: 'banana',
    },

    // Vegetables
    {
      id: 'grovy-ginger-001',
      name: 'Fresh Ginger Root',
      slug: 'fresh-ginger-root',
      price: 0.89,
      category: 'Vegetables',
      description:
        'Fresh ginger for teas, stir-fries, soups, and everyday home cooking.',
      stock: 26,
      imageKey: 'ginger',
    },
    {
      id: 'grovy-young-ginger-001',
      name: 'Young Ginger Root',
      slug: 'young-ginger-root',
      price: 0.99,
      category: 'Vegetables',
      description:
        'Tender young ginger that blends nicely into marinades, soups, and light sauces.',
      stock: 21,
      imageKey: 'ginger',
    },
    {
      id: 'grovy-shimla-pepper-001',
      name: 'Green Shimla Pepper',
      slug: 'green-shimla-pepper',
      price: 1.49,
      category: 'Vegetables',
      description:
        'Crisp green capsicum for curries, pasta sauces, and fresh salad bowls.',
      stock: 22,
      imageKey: 'shimlaPepper',
    },
    {
      id: 'grovy-red-shimla-pepper-001',
      name: 'Red Shimla Pepper',
      slug: 'red-shimla-pepper',
      price: 1.69,
      category: 'Vegetables',
      description:
        'Sweet red capsicum for stir-fries, sandwich fillings, and colorful home cooking.',
      stock: 18,
      imageKey: 'shimlaPepper',
    },
    {
      id: 'grovy-yellow-shimla-pepper-001',
      name: 'Yellow Shimla Pepper',
      slug: 'yellow-shimla-pepper',
      price: 1.69,
      category: 'Vegetables',
      description:
        'Mild yellow capsicum that brightens roasted vegetables, pasta, and salad mixes.',
      stock: 17,
      imageKey: 'shimlaPepper',
    },

    // Dairy and Eggs
    {
      id: 'grovy-eggs-red-001',
      name: 'Brown Eggs Tray',
      slug: 'brown-eggs-tray',
      price: 2.99,
      category: 'Dairy and Eggs',
      description:
        'Farm brown eggs for breakfast, baking, and everyday fridge restocks.',
      unit: '1 tray',
      size: '12 pcs',
      tags: ['dairy', 'eggs', 'breakfast'],
      keywords: ['protein', 'baking', 'fridge'],
      stock: 22,
      imageKey: 'eggsRedChick',
    },
    {
      id: 'grovy-eggs-white-001',
      name: 'White Eggs Pack',
      slug: 'white-eggs-pack',
      price: 3.19,
      category: 'Dairy and Eggs',
      description:
        'Fresh white eggs packed for omelets, baking, and daily home cooking.',
      unit: '1 tray',
      size: '12 pcs',
      tags: ['dairy', 'eggs', 'breakfast'],
      keywords: ['omelet', 'protein', 'fridge'],
      stock: 18,
      imageKey: 'eggsWhiteChick',
    },

    // Beverages
    {
      id: 'grovy-orange-juice-001',
      name: 'Orange Juice 1L',
      slug: 'orange-juice-1l',
      price: 3.59,
      category: 'Beverages',
      description:
        'Bright citrus juice for breakfast, lunch boxes, and chilled pantry staples.',
      stock: 18,
      imageKey: 'orangeJuice',
    },
    {
      id: 'grovy-orange-juice-mini-001',
      name: 'Orange Juice 500ml',
      slug: 'orange-juice-500ml',
      price: 2.19,
      category: 'Beverages',
      description:
        'Compact orange juice bottle for quick breakfast runs and smaller fridge shelves.',
      stock: 20,
      imageKey: 'orangeJuice',
    },
    {
      id: 'grovy-apple-juice-001',
      name: 'Apple Juice 1L',
      slug: 'apple-juice-1l',
      price: 3.39,
      category: 'Beverages',
      description:
        'Smooth apple juice that fits the Grovy demo pantry and beverage shelf.',
      stock: 17,
      imageKey: 'appleJuice',
    },
    {
      id: 'grovy-apple-juice-family-001',
      name: 'Apple Juice Family Pack',
      slug: 'apple-juice-family-pack',
      price: 4.49,
      category: 'Beverages',
      description:
        'A larger apple juice bottle made for family breakfast tables and shared snacks.',
      stock: 14,
      imageKey: 'appleJuice',
    },
    {
      id: 'grovy-classic-cola-001',
      name: 'Classic Cola Can',
      slug: 'classic-cola-can',
      price: 0.99,
      category: 'Beverages',
      description:
        'Single-serve cola can for snack runs, combo meals, and quick refreshment.',
      stock: 44,
      imageKey: 'cokeClassic',
    },
    {
      id: 'grovy-diet-cola-001',
      name: 'Diet Cola Can',
      slug: 'diet-cola-can',
      price: 1.05,
      category: 'Beverages',
      description:
        'Light cola can that works for chilled meal combos and simple on-the-go add-ons.',
      stock: 33,
      imageKey: 'dietCola',
    },
    {
      id: 'grovy-pepsi-can-001',
      name: 'Pepsi Refresh Can',
      slug: 'pepsi-refresh-can',
      price: 1.05,
      category: 'Beverages',
      description:
        'Cold soft drink can for lunch sets, snack pairings, and fridge-ready refreshment.',
      stock: 31,
      imageKey: 'pepsiCan',
    },
    {
      id: 'grovy-sprite-can-001',
      name: 'Lemon Lime Soda Can',
      slug: 'lemon-lime-soda-can',
      price: 0.99,
      category: 'Beverages',
      description:
        'Crisp lemon-lime soda can that pairs well with lunch and checkout add-ons.',
      stock: 39,
      imageKey: 'spriteCan',
    },

    // Pantry
    {
      id: 'grovy-egg-noodles-001',
      name: 'Egg Noodles',
      slug: 'egg-noodles',
      price: 2.49,
      category: 'Pantry',
      description:
        'Quick-cook egg noodles for stir-fries, soups, and simple dinner prep.',
      stock: 29,
      imageKey: 'eggNoodles',
    },
    {
      id: 'grovy-stir-fry-noodles-001',
      name: 'Stir-Fry Noodles',
      slug: 'stir-fry-noodles',
      price: 2.69,
      category: 'Pantry',
      description:
        'Pantry noodles made for quick stir-fries, soups, and easy weeknight bowls.',
      stock: 23,
      imageKey: 'eggNoodles',
    },
    {
      id: 'grovy-pasta-001',
      name: 'Durum Wheat Pasta',
      slug: 'durum-wheat-pasta',
      price: 2.79,
      category: 'Pantry',
      description:
        'Reliable pasta staple for weeknight sauces, baked dishes, and meal prep.',
      stock: 27,
      imageKey: 'pasta',
    },
    {
      id: 'grovy-penne-pasta-001',
      name: 'Penne Pasta',
      slug: 'penne-pasta',
      price: 2.99,
      category: 'Pantry',
      description:
        'Classic penne pasta that holds sauces well for simple bakes and quick dinners.',
      stock: 24,
      imageKey: 'pasta',
    },
    {
      id: 'grovy-rice-001',
      name: 'Long Grain Rice',
      slug: 'long-grain-rice',
      price: 5.99,
      category: 'Pantry',
      description:
        'Versatile long grain rice for family meals, bowls, and side dishes.',
      stock: 21,
      imageKey: 'rice',
    },
    {
      id: 'grovy-jasmine-rice-001',
      name: 'Jasmine Rice',
      slug: 'jasmine-rice',
      price: 6.29,
      category: 'Pantry',
      description:
        'Fragrant jasmine rice for home dinners, rice bowls, and comforting side plates.',
      stock: 19,
      imageKey: 'rice',
    },
    {
      id: 'grovy-basmati-rice-001',
      name: 'Basmati Rice',
      slug: 'basmati-rice',
      price: 6.69,
      category: 'Pantry',
      description:
        'Light basmati rice for curry nights, pilaf, and everyday premium pantry stock.',
      stock: 18,
      imageKey: 'rice',
    },
    {
      id: 'grovy-red-lentils-001',
      name: 'Red Lentils',
      slug: 'red-lentils',
      price: 2.89,
      category: 'Pantry',
      description:
        'Fast-cooking red lentils for soups, dal, and protein-friendly pantry cooking.',
      stock: 26,
      imageKey: 'pulses',
    },
    {
      id: 'grovy-chickpeas-001',
      name: 'Chickpeas',
      slug: 'chickpeas',
      price: 3.19,
      category: 'Pantry',
      description:
        'Versatile chickpeas for salads, curries, grain bowls, and roasted snacks.',
      stock: 24,
      imageKey: 'pulses',
    },
    {
      id: 'grovy-cooking-oil-001',
      name: 'Everyday Cooking Oil',
      slug: 'everyday-cooking-oil',
      price: 4.59,
      category: 'Pantry',
      description:
        'Neutral cooking oil for everyday frying, sauteing, and pantry restocking.',
      stock: 20,
      imageKey: 'oilAndGhee',
    },
    {
      id: 'grovy-eggless-mayo-001',
      name: 'Eggless Mayonnaise',
      slug: 'eggless-mayonnaise',
      price: 3.49,
      category: 'Pantry',
      description:
        'Creamy eggless mayo for sandwiches, wraps, salads, and quick snack prep.',
      stock: 16,
      imageKey: 'mayonnaise',
    },

    // Meat
    {
      id: 'grovy-chicken-001',
      name: 'Chicken Breast Cuts',
      slug: 'chicken-breast-cuts',
      price: 6.49,
      category: 'Meat',
      description:
        'Fresh chicken cuts for grills, curries, stir-fries, and protein-focused meals.',
      stock: 16,
      imageKey: 'chicken',
    },
    {
      id: 'grovy-chicken-thigh-001',
      name: 'Chicken Thigh Fillets',
      slug: 'chicken-thigh-fillets',
      price: 6.89,
      category: 'Meat',
      description:
        'Tender chicken thigh fillets for roasting, pan-searing, and richer home cooking.',
      stock: 15,
      imageKey: 'chicken',
    },
    {
      id: 'grovy-broiler-chicken-001',
      name: 'Broiler Chicken Pack',
      slug: 'broiler-chicken-pack',
      price: 7.19,
      category: 'Meat',
      description:
        'Family-ready chicken pack suited for curries, grills, and batch meal prep.',
      stock: 12,
      imageKey: 'chicken',
    },
    {
      id: 'grovy-beef-bone-001',
      name: 'Beef Soup Bones',
      slug: 'beef-soup-bones',
      price: 5.49,
      category: 'Meat',
      description:
        'Rich beef bones for broths, stews, and slow-cooked comfort meals at home.',
      stock: 14,
      imageKey: 'beef',
    },
    {
      id: 'grovy-beef-cubes-001',
      name: 'Lean Beef Cubes',
      slug: 'lean-beef-cubes',
      price: 7.99,
      category: 'Meat',
      description:
        'Lean beef cubes for stir-fries, curries, and quick skillet meals with protein.',
      stock: 11,
      imageKey: 'beef',
    },
  ].map(createDemoProduct),
);
