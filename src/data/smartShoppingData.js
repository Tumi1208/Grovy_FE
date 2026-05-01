function freezeBasket(definition) {
  return Object.freeze({
    ...definition,
    productKeys: Object.freeze([...(definition.productKeys || [])]),
  });
}

function freezeBudgetPreset(definition) {
  return Object.freeze({ ...definition });
}

export const SmartBaskets = Object.freeze({
  weeklyFreshBasket: freezeBasket({
    id: 'weeklyFreshBasket',
    title: 'Weekly Fresh Basket',
    subtitle: 'Fresh produce and pantry basics for the week',
    tags: ['Weekly', 'Fresh'],
    productKeys: ['apple', 'banana', 'eggs', 'rice', 'chicken', 'ginger'],
  }),
  studentBudgetBasket: freezeBasket({
    id: 'studentBudgetBasket',
    title: 'Student Budget Basket',
    subtitle: 'Affordable basics for simple daily meals',
    tags: ['Budget', 'Student'],
    productKeys: ['eggs', 'rice', 'banana', 'eggNoodles', 'cokeClassic'],
  }),
  healthyBreakfastBasket: freezeBasket({
    id: 'healthyBreakfastBasket',
    title: 'Healthy Breakfast Basket',
    subtitle: 'Quick morning groceries with fruit and protein',
    tags: ['Healthy', 'Morning'],
    productKeys: ['apple', 'banana', 'eggs', 'appleJuice'],
  }),
  familyDinnerBasket: freezeBasket({
    id: 'familyDinnerBasket',
    title: 'Family Dinner Basket',
    subtitle: 'Protein, pantry, and fresh add-ons for dinner',
    tags: ['Dinner', 'Family'],
    productKeys: ['chicken', 'beef', 'rice', 'ginger', 'shimlaPepper'],
  }),
});

export const BudgetPresets = Object.freeze({
  under10: freezeBudgetPreset({
    id: 'under10',
    label: 'Under $10',
    budget: 10,
    description: 'Quick essentials for a light top-up.',
  }),
  under20: freezeBudgetPreset({
    id: 'under20',
    label: 'Under $20',
    budget: 20,
    description: 'A student-friendly basket for a few meals.',
  }),
  under50: freezeBudgetPreset({
    id: 'under50',
    label: 'Under $50',
    budget: 50,
    description: 'A fuller weekly grocery reset with more variety.',
  }),
});

export const RecipeBaskets = Object.freeze({
  eggNoodlesMeal: freezeBasket({
    id: 'eggNoodlesMeal',
    title: 'Egg Noodles Meal',
    subtitle: 'Simple comfort meal ingredients',
    tags: ['Quick', 'Comfort'],
    productKeys: ['eggNoodles', 'eggs', 'ginger', 'chicken'],
  }),
  fruitBreakfast: freezeBasket({
    id: 'fruitBreakfast',
    title: 'Fruit Breakfast',
    subtitle: 'Light breakfast with fruit and juice',
    tags: ['Breakfast', 'Fresh'],
    productKeys: ['apple', 'banana', 'appleJuice'],
  }),
  beefSoup: freezeBasket({
    id: 'beefSoup',
    title: 'Beef Soup',
    subtitle: 'A warm meal basket with beef and pantry basics',
    tags: ['Warm', 'Dinner'],
    productKeys: ['beef', 'ginger', 'rice', 'shimlaPepper'],
  }),
});
