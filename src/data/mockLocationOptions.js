const POPULAR_LOCATION_OPTIONS = Object.freeze([
  'District 1, Ho Chi Minh City',
  'Thu Duc District, Ho Chi Minh City',
  'Binh Thanh District, Ho Chi Minh City',
  'Thu Dau Mot, Binh Duong',
  'Cau Giay, Hanoi',
  'Ba Dinh, Hanoi',
]);

export const MOCK_LOCATION_OPTIONS = Object.freeze([
  'District 1, Ho Chi Minh City',
  'District 2, Ho Chi Minh City',
  'District 3, Ho Chi Minh City',
  'District 4, Ho Chi Minh City',
  'District 5, Ho Chi Minh City',
  'District 7, Ho Chi Minh City',
  'District 10, Ho Chi Minh City',
  'District 11, Ho Chi Minh City',
  'Binh Thanh District, Ho Chi Minh City',
  'Thu Duc District, Ho Chi Minh City',
  'Go Vap District, Ho Chi Minh City',
  'Tan Binh District, Ho Chi Minh City',
  'Tan Phu District, Ho Chi Minh City',
  'Phu Nhuan District, Ho Chi Minh City',
  'Nha Be, Ho Chi Minh City',
  'Hoc Mon, Ho Chi Minh City',
  'Thu Dau Mot, Binh Duong',
  'Di An, Binh Duong',
  'Thuan An, Binh Duong',
  'Bien Hoa, Dong Nai',
  'Long Khanh, Dong Nai',
  'Tan An, Long An',
  'Ha Dong, Hanoi',
  'Cau Giay, Hanoi',
  'Ba Dinh, Hanoi',
  'Tay Ho, Hanoi',
  'Long Bien, Hanoi',
  'Nam Tu Liem, Hanoi',
  'Hai Chau, Da Nang',
  'Son Tra, Da Nang',
]);

export function normalizeLocationText(value) {
  return `${value || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function getLocationMatchRank(locationLabel, query) {
  const normalizedLabel = normalizeLocationText(locationLabel);

  if (!query) {
    return {
      index: 999,
      priority: 99,
    };
  }

  const matchIndex = normalizedLabel.indexOf(query);

  if (matchIndex === -1) {
    return null;
  }

  if (normalizedLabel.startsWith(query)) {
    return {
      index: matchIndex,
      priority: 0,
    };
  }

  const startsAtWordBoundary = normalizedLabel
    .split(/[^a-z0-9]+/g)
    .some(word => word.startsWith(query));

  return {
    index: matchIndex,
    priority: startsAtWordBoundary ? 1 : 2,
  };
}

export function getLocationSuggestions(query, limit = 6) {
  const normalizedQuery = normalizeLocationText(query);

  if (!normalizedQuery) {
    return POPULAR_LOCATION_OPTIONS.slice(0, limit);
  }

  return MOCK_LOCATION_OPTIONS.map(locationLabel => {
    const matchRank = getLocationMatchRank(locationLabel, normalizedQuery);

    if (!matchRank) {
      return null;
    }

    return {
      label: locationLabel,
      ...matchRank,
    };
  })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      if (left.index !== right.index) {
        return left.index - right.index;
      }

      if (left.label.length !== right.label.length) {
        return left.label.length - right.label.length;
      }

      return left.label.localeCompare(right.label);
    })
    .slice(0, limit)
    .map(item => item.label);
}
