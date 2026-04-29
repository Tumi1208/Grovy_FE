import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategoryFallbackImage } from '../../assets/productImages';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import DirectionalHint from '../../components/DirectionalHint';
import ProductCard from '../../components/ProductCard';
import ProductImage from '../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import {
  CUSTOMER_DEMO_PRODUCTS,
  EXPLORE_CATEGORY_CARDS,
} from '../../data/customerTabsData';
import { useCart } from '../../context/CartContext';
import { useFavourite } from '../../context/FavouriteContext';
import { getProducts } from '../../services/productService';
import {
  categoryMatchesSearch,
  productMatchesSearch,
} from '../../utils/search';

const FALLBACK_CATEGORY_COLORS = Object.freeze({
  backgroundColor: '#F2EEE8',
  borderColor: '#E2D8CC',
});

function normalizeLookupKey(value) {
  return typeof value === 'string' && value.trim()
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
    : '';
}

function formatResultCount(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatDerivedCategoryTitle(category = '') {
  return category.replace(/\s+and\s+/gi, ' & ');
}

function createDerivedCategoryCard(category) {
  return {
    id: `derived-${normalizeLookupKey(category)}`,
    title: formatDerivedCategoryTitle(category),
    category,
    description: `Browse ${category.toLowerCase()} items from the full grocery assortment.`,
    aliases: [],
    ...FALLBACK_CATEGORY_COLORS,
  };
}

function SearchGlyph({ color = UI_COLORS.mutedStrong }) {
  return (
    <View style={styles.searchGlyph}>
      <View style={[styles.searchGlyphCircle, { borderColor: color }]} />
      <View style={[styles.searchGlyphHandle, { backgroundColor: color }]} />
    </View>
  );
}

function ExploreCategoryCard({ card, itemCount, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#EDE4D8' }}
      onPress={() => onPress(card)}
      style={({ pressed }) => [
        styles.categoryCard,
        {
          backgroundColor: card.backgroundColor,
          borderColor: card.borderColor,
        },
        pressed && styles.categoryCardPressed,
      ]}
    >
      <View style={styles.categoryCopy}>
        <View style={styles.categoryMetaRow}>
          <View style={styles.categoryCountPill}>
            <Text style={styles.categoryCountLabel}>
              {formatResultCount(itemCount, 'item')}
            </Text>
          </View>
          <DirectionalHint
            chevronSize={8}
            color={UI_COLORS.mutedStrong}
            mode="tinted"
            size={22}
            style={styles.categoryIndicator}
          />
        </View>

        <Text style={styles.categoryLabel}>{card.title}</Text>
        <Text style={styles.categoryDescription}>{card.description}</Text>
      </View>

      <View style={styles.categoryImageWrap}>
        <ProductImage
          name={card.title}
          resizeMode="contain"
          source={getCategoryFallbackImage(card.category)}
          style={styles.categoryImage}
        />
      </View>
    </Pressable>
  );
}

function ExploreScreen({ navigation }) {
  const { addToCart, totalItems } = useCart();
  const { isFavourite, toggleFavourite } = useFavourite();
  const [products, setProducts] = useState(CUSTOMER_DEMO_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      if (isMounted) {
        setIsLoading(true);
        setErrorMessage('');
      }

      try {
        const items = await getProducts();

        if (isMounted) {
          setProducts(items.length > 0 ? items : CUSTOMER_DEMO_PRODUCTS);
        }
      } catch (error) {
        if (isMounted) {
          setProducts(CUSTOMER_DEMO_PRODUCTS);
          setErrorMessage(error.message || 'Could not load this assortment.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuery = useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery],
  );
  const hasSearchQuery = Boolean(normalizedQuery);

  const categoryCounts = useMemo(
    () =>
      products.reduce((counts, product) => {
        const categoryKey = normalizeLookupKey(product.category);

        if (categoryKey) {
          counts[categoryKey] = (counts[categoryKey] || 0) + 1;
        }

        return counts;
      }, {}),
    [products],
  );

  const searchableCategories = useMemo(() => {
    const cardsByCategory = new Map(
      EXPLORE_CATEGORY_CARDS.map(card => [
        normalizeLookupKey(card.category),
        card,
      ]),
    );

    products.forEach(product => {
      const categoryKey = normalizeLookupKey(product.category);

      if (!categoryKey || cardsByCategory.has(categoryKey)) {
        return;
      }

      cardsByCategory.set(
        categoryKey,
        createDerivedCategoryCard(product.category),
      );
    });

    return Array.from(cardsByCategory.values());
  }, [products]);

  const productMatches = useMemo(() => {
    if (!hasSearchQuery) {
      return [];
    }

    return products.filter(product =>
      productMatchesSearch(product, normalizedQuery),
    );
  }, [hasSearchQuery, normalizedQuery, products]);

  const categoryMatches = useMemo(() => {
    if (!hasSearchQuery) {
      return EXPLORE_CATEGORY_CARDS;
    }

    return searchableCategories.filter(card =>
      categoryMatchesSearch(card, normalizedQuery),
    );
  }, [hasSearchQuery, normalizedQuery, searchableCategories]);

  const visibleCategories = hasSearchQuery
    ? categoryMatches
    : EXPLORE_CATEGORY_CARDS;
  const hasNoResults =
    hasSearchQuery &&
    productMatches.length === 0 &&
    categoryMatches.length === 0;
  const resultLabel = hasSearchQuery
    ? `${formatResultCount(productMatches.length, 'product')}, ${formatResultCount(
        categoryMatches.length,
        'aisle',
      )}`
    : formatResultCount(visibleCategories.length, 'aisle');

  function handleClearSearch() {
    setSearchQuery('');
  }

  function getCategoryCount(category) {
    return categoryCounts[normalizeLookupKey(category)] || 0;
  }

  function handleOpenCategory(card) {
    navigation.navigate(CUSTOMER_ROUTES.CATEGORY_PRODUCTS, {
      category: card.category,
      title: card.title,
    });
  }

  function handleOpenProduct(product) {
    if (!product?.id) {
      return;
    }

    navigation.navigate(CUSTOMER_ROUTES.PRODUCT_DETAIL, {
      productId: product.id,
      initialProduct: product,
    });
  }

  function handleQuickAddToCart(product) {
    if (!product?.id) {
      return;
    }

    addToCart(product, 1);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Explore the store</Text>
          <Text style={styles.subtitle}>
            Browse aisles built around real grocery shopping, not decorative
            sections.
          </Text>

          {isLoading || errorMessage ? (
            <View
              style={[
                styles.statusBanner,
                errorMessage ? styles.statusBannerWarning : null,
              ]}
            >
              <Text
                style={[
                  styles.statusBannerText,
                  errorMessage ? styles.statusBannerTextWarning : null,
                ]}
              >
                {isLoading
                  ? 'Refreshing the latest grocery assortment.'
                  : 'Showing the saved assortment while the catalog reconnects.'}
              </Text>
            </View>
          ) : null}

          <View style={styles.searchBar}>
            <SearchGlyph />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search groceries and aisles"
              placeholderTextColor={UI_COLORS.muted}
              style={styles.searchInput}
              value={searchQuery}
            />
            {normalizedQuery ? (
              <Pressable
                android_ripple={{ color: '#ECE2D7' }}
                onPress={handleClearSearch}
                style={({ pressed }) => [
                  styles.clearSearchButton,
                  pressed && styles.clearSearchButtonPressed,
                ]}
              >
                <Text style={styles.clearSearchButtonLabel}>×</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{resultLabel}</Text>
          </View>

          {hasSearchQuery && productMatches.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Products</Text>
                <Text style={styles.sectionMeta}>
                  {formatResultCount(productMatches.length, 'match', 'matches')}
                </Text>
              </View>

              <View style={styles.productGrid}>
                {productMatches.map(product => (
                  <ProductCard
                    isFavourite={isFavourite(product.id)}
                    key={product.id}
                    onAddToCart={handleQuickAddToCart}
                    onPress={handleOpenProduct}
                    onToggleFavourite={toggleFavourite}
                    product={product}
                    style={styles.productCardCell}
                  />
                ))}
              </View>
            </>
          ) : null}

          {visibleCategories.length > 0 ? (
            <>
              {hasSearchQuery ? (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Aisles</Text>
                  <Text style={styles.sectionMeta}>
                    {formatResultCount(
                      visibleCategories.length,
                      'match',
                      'matches',
                    )}
                  </Text>
                </View>
              ) : null}

              {visibleCategories.map(card => (
                <ExploreCategoryCard
                  card={card}
                  itemCount={getCategoryCount(card.category)}
                  key={card.id}
                  onPress={handleOpenCategory}
                />
              ))}
            </>
          ) : null}

          {hasNoResults ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No results found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try another keyword to browse groceries.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.bottomNavWrap}>
          <CustomerBottomNav
            activeRoute={CUSTOMER_ROUTES.EXPLORE}
            navigation={navigation}
            totalItems={totalItems}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.screenLight,
  },
  screen: {
    flex: 1,
    backgroundColor: UI_COLORS.screenLight,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 132,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.screenTitle,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 8,
    marginBottom: 18,
    maxWidth: '90%',
  },
  statusBanner: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.lg,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
    ...UI_SHADOWS.card,
  },
  statusBannerWarning: {
    backgroundColor: UI_COLORS.errorSoft,
    borderColor: '#EBCFC8',
  },
  statusBannerText: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 19,
  },
  statusBannerTextWarning: {
    color: UI_COLORS.accentRed,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 16,
    minHeight: UI_LAYOUT.searchHeight,
    marginBottom: 14,
    ...UI_SHADOWS.card,
  },
  searchGlyph: {
    width: 18,
    height: 18,
    position: 'relative',
    marginRight: 12,
  },
  searchGlyphCircle: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.8,
  },
  searchGlyphHandle: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 6,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 8,
  },
  clearSearchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: UI_COLORS.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearSearchButtonPressed: {
    opacity: 0.88,
  },
  clearSearchButtonLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 17,
    lineHeight: 17,
    fontWeight: '700',
  },
  resultRow: {
    marginBottom: 14,
  },
  resultLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  sectionMeta: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productCardCell: {
    width: '48%',
    marginBottom: 16,
  },
  categoryCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...UI_SHADOWS.card,
  },
  categoryCardPressed: {
    opacity: 0.96,
  },
  categoryCopy: {
    flex: 1,
    paddingRight: 16,
  },
  categoryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryCountPill: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.38)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryCountLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  categoryIndicator: {
    marginLeft: 12,
  },
  categoryLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 27,
  },
  categoryDescription: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 8,
    maxWidth: '88%',
  },
  categoryImageWrap: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: 70,
    height: 70,
  },
  emptyState: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 22,
    marginTop: 8,
    alignItems: 'center',
    ...UI_SHADOWS.card,
  },
  emptyStateTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    textAlign: 'center',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: UI_LAYOUT.bottomNavSide,
    right: UI_LAYOUT.bottomNavSide,
    bottom: UI_LAYOUT.bottomNavBottom,
  },
});

export default ExploreScreen;
