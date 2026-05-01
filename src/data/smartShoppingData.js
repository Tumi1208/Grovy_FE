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
    productKeys: ['apple', 'banana', 'eggs', 'rice', 'chicken', 'ginger'],
  }),
  studentBudgetBasket: freezeBasket({
    id: 'studentBudgetBasket',
    title: 'Student Budget Basket',
    subtitle: 'Affordable basics for simple daily meals',
    productKeys: ['eggs', 'rice', 'banana', 'eggNoodles', 'cokeClassic'],
  }),
  healthyBreakfastBasket: freezeBasket({
    id: 'healthyBreakfastBasket',
    title: 'Healthy Breakfast Basket',
    subtitle: 'Quick morning groceries with fruit and protein',
    productKeys: ['apple', 'banana', 'eggs', 'appleJuice'],
  }),
  familyDinnerBasket: freezeBasket({
    id: 'familyDinnerBasket',
    title: 'Family Dinner Basket',
    subtitle: 'Protein, pantry, and fresh add-ons for dinner',
    productKeys: ['chicken', 'beef', 'rice', 'ginger', 'shimlaPepper'],
  }),
});

export const BudgetPresets = Object.freeze({
  under10: freezeBudgetPreset({
    id: 'under10',
    label: 'Under $10',
    budget: 10,
  }),
  under20: freezeBudgetPreset({
    id: 'under20',
    label: 'Under $20',
    budget: 20,
  }),
  under50: freezeBudgetPreset({
    id: 'under50',
    label: 'Under $50',
    budget: 50,
  }),
});

export const RecipeBaskets = Object.freeze({
  eggNoodlesMeal: freezeBasket({
    id: 'eggNoodlesMeal',
    title: 'Egg Noodles Meal',
    subtitle: 'Simple comfort meal ingredients',
    productKeys: ['eggNoodles', 'eggs', 'ginger', 'chicken'],
  }),
  fruitBreakfast: freezeBasket({
    id: 'fruitBreakfast',
    title: 'Fruit Breakfast',
    subtitle: 'Light breakfast with fruit and juice',
    productKeys: ['apple', 'banana', 'appleJuice'],
  }),
  beefSoup: freezeBasket({
    id: 'beefSoup',
    title: 'Beef Soup',
    subtitle: 'A warm meal basket with beef and pantry basics',
    productKeys: ['beef', 'ginger', 'rice', 'shimlaPepper'],
  }),
});
