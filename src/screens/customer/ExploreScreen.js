import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategoryFallbackImage } from '../../assets/productImages';
import DirectionalHint from '../../components/DirectionalHint';
import HomeProductCard from '../../components/home/HomeProductCard';
import PrimaryButton from '../../components/PrimaryButton';
import ProductImage from '../../components/ProductImage';
import ProductQuickActionsSheet from '../../components/ProductQuickActionsSheet';
import ScalePressable from '../../components/ScalePressable';
import { getProductImage } from '../../constants/productImages';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_SPACING,
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

if (
  Platform.OS === 'android' &&
  typeof UIManager.setLayoutAnimationEnabledExperimental === 'function'
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

function configureExploreFilterLayout() {
  LayoutAnimation.configureNext({
    duration: 180,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

function SearchGlyph({ color = UI_COLORS.mutedStrong, style }) {
  return (
    <View style={[styles.searchGlyph, style]}>
      <View style={[styles.searchGlyphCircle, { borderColor: color }]} />
      <View style={[styles.searchGlyphHandle, { backgroundColor: color }]} />
    </View>
  );
}

function ExploreFilterChip({
  count,
  isActive = false,
  label,
  onPress,
  testID,
}) {
  return (
    <ScalePressable
      android_ripple={{ color: '#E6EEE3' }}
      onPress={onPress}
      pressScale={0.98}
      style={styles.filterChipShell}
      testID={testID}
    >
      <View style={[styles.filterChip, isActive && styles.filterChipActive]}>
        <Text
          numberOfLines={1}
          style={[
            styles.filterChipLabel,
            isActive && styles.filterChipLabelActive,
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.filterChipCount,
            isActive && styles.filterChipCountActive,
          ]}
        >
          <Text
            style={[
              styles.filterChipCountLabel,
              isActive && styles.filterChipCountLabelActive,
            ]}
          >
            {count}
          </Text>
        </View>
      </View>
    </ScalePressable>
  );
}

function ExploreCategoryCard({ card, isActive = false, itemCount, onPress }) {
  return (
    <ScalePressable
      android_ripple={{ color: '#EDE4D8' }}
      onPress={() => onPress(card)}
      pressScale={0.992}
      style={({ pressed }) => [
        styles.categoryCard,
        {
          backgroundColor: card.backgroundColor,
          borderColor: card.borderColor,
        },
        isActive && styles.categoryCardActive,
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
          {isActive ? (
            <View style={styles.categorySelectionPill}>
              <Text style={styles.categorySelectionPillLabel}>
                Quick filter on
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.categoryLabel}>{card.title}</Text>
        <Text style={styles.categoryDescription}>{card.description}</Text>

        <View style={styles.categoryFooterRow}>
          <Text style={styles.categoryActionLabel}>Open aisle</Text>
          <DirectionalHint
            chevronSize={8}
            color={UI_COLORS.mutedStrong}
            mode="tinted"
            size={22}
            style={styles.categoryIndicator}
          />
        </View>
      </View>

      <View style={styles.categoryImageWrap}>
        <ProductImage
          name={card.title}
          resizeMode="contain"
          source={getCategoryFallbackImage(card.category)}
          style={styles.categoryImage}
        />
      </View>
    </ScalePressable>
  );
}

function ExploreScreen({ navigation }) {
  const { addToCart } = useCart();
  const { addToFavourites, isFavourite } = useFavourite();
  const [products, setProducts] = useState(CUSTOMER_DEMO_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedQuickActionProduct, setSelectedQuickActionProduct] =
    useState(null);

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
  const selectedCategoryKey = useMemo(
    () => normalizeLookupKey(selectedCategory),
    [selectedCategory],
  );

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

  const selectedCategoryCard = useMemo(
    () =>
      searchableCategories.find(
        card => normalizeLookupKey(card.category) === selectedCategoryKey,
      ) || null,
    [searchableCategories, selectedCategoryKey],
  );

  const selectedCategoryProducts = useMemo(() => {
    if (!selectedCategoryKey) {
      return [];
    }

    return products.filter(
      product => normalizeLookupKey(product.category) === selectedCategoryKey,
    );
  }, [products, selectedCategoryKey]);

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
      return searchableCategories;
    }

    return searchableCategories.filter(card =>
      categoryMatchesSearch(card, normalizedQuery),
    );
  }, [hasSearchQuery, normalizedQuery, searchableCategories]);

  const visibleCategories = categoryMatches;
  const visibleProducts = hasSearchQuery
    ? productMatches
    : selectedCategoryProducts;
  const hasSelectedCategory = Boolean(selectedCategoryCard);
  const hasProductResults = visibleProducts.length > 0;
  const hasNoResults = hasSearchQuery
    ? productMatches.length === 0 && categoryMatches.length === 0
    : hasSelectedCategory && selectedCategoryProducts.length === 0;
  const resultLabel = hasSearchQuery
    ? `${formatResultCount(
        productMatches.length,
        'product',
      )}, ${formatResultCount(categoryMatches.length, 'aisle')}`
    : hasSelectedCategory
    ? `${formatResultCount(selectedCategoryProducts.length, 'product')} in ${
        selectedCategoryCard.title
      }`
    : `${formatResultCount(visibleCategories.length, 'aisle')} to browse`;
  const resultSupportLabel = hasSearchQuery
    ? hasSelectedCategory
      ? `Search is showing matches across every aisle. Clear search to return to ${selectedCategoryCard.title}.`
      : 'Search checks specific products first, then matching aisle cards.'
    : hasSelectedCategory
    ? `Quick filter is previewing ${selectedCategoryCard.title}. Tap the aisle card below to open the full aisle page.`
    : 'Use a quick aisle filter for product previews or open an aisle card for the full page.';
  const productSectionTitle = hasSearchQuery
    ? 'Products'
    : selectedCategoryCard
    ? `Browse ${selectedCategoryCard.title}`
    : 'Products';
  const productSectionMeta = hasSearchQuery
    ? formatResultCount(productMatches.length, 'match', 'matches')
    : formatResultCount(selectedCategoryProducts.length, 'product');
  const categorySectionTitle = hasSearchQuery
    ? 'Matching aisles'
    : 'Aisles to browse';
  const emptyStateTitle = hasSearchQuery
    ? `No matches for "${searchQuery.trim()}"`
    : `No items in ${selectedCategoryCard?.title || 'this aisle'} yet`;
  const emptyStateSubtitle = hasSearchQuery
    ? 'Try another product keyword or browse the aisle list below.'
    : 'Clear the aisle filter to jump back to every aisle.';

  function handleClearSearch() {
    configureExploreFilterLayout();
    setSearchQuery('');
  }

  function handleSelectCategory(card) {
    if (!card?.category) {
      return;
    }

    configureExploreFilterLayout();
    setSelectedCategory(currentCategory =>
      normalizeLookupKey(currentCategory) === normalizeLookupKey(card.category)
        ? ''
        : card.category,
    );
  }

  function handleClearCategoryFilter() {
    if (!selectedCategoryKey) {
      return;
    }

    configureExploreFilterLayout();
    setSelectedCategory('');
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

  function handleOpenQuickActions(product) {
    if (!product?.id) {
      return;
    }

    setSelectedQuickActionProduct(product);
  }

  function handleCloseQuickActions() {
    setSelectedQuickActionProduct(null);
  }

  function handleAddToFavourite(product) {
    if (!product?.id) {
      return;
    }

    addToFavourites(product);
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
            Browse aisles or search for any grocery item.
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

          <View
            style={[
              styles.searchBar,
              isSearchFocused && styles.searchBarFocused,
            ]}
          >
            <View
              style={[
                styles.searchGlyphWrap,
                isSearchFocused && styles.searchGlyphWrapFocused,
              ]}
            >
              <SearchGlyph
                color={
                  isSearchFocused
                    ? UI_COLORS.accentGreen
                    : UI_COLORS.mutedStrong
                }
              />
            </View>
            <TextInput
              onChangeText={setSearchQuery}
              onBlur={() => setIsSearchFocused(false)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search groceries and aisles"
              placeholderTextColor={UI_COLORS.muted}
              style={styles.searchInput}
              value={searchQuery}
            />
            {normalizedQuery ? (
              <ScalePressable
                android_ripple={{ color: '#ECE2D7' }}
                onPress={handleClearSearch}
                pressScale={0.94}
                style={({ pressed }) => [
                  styles.clearSearchButton,
                  pressed && styles.clearSearchButtonPressed,
                ]}
              >
                <Text style={styles.clearSearchButtonLabel}>×</Text>
              </ScalePressable>
            ) : null}
          </View>
          <Text style={styles.searchHelper}>
            Search specific groceries like eggs, apples, or cola, or jump into
            an aisle below.
          </Text>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{resultLabel}</Text>
            <Text style={styles.resultSupportLabel}>{resultSupportLabel}</Text>
          </View>

          <View style={styles.filterPanel}>
            <View style={styles.filterHeader}>
              <View style={styles.filterHeaderCopy}>
                <Text style={styles.filterTitle}>Quick aisle filters</Text>
                <Text style={styles.filterSubtitle}>
                  Preview products from one aisle without leaving Explore.
                </Text>
              </View>
              {hasSelectedCategory ? (
                <ScalePressable
                  android_ripple={{ color: '#E8DED2' }}
                  onPress={handleClearCategoryFilter}
                  pressScale={0.96}
                  style={styles.clearFilterButtonShell}
                  testID="explore-clear-filter"
                >
                  <View style={styles.clearFilterButton}>
                    <Text style={styles.clearFilterButtonLabel}>
                      Clear filter
                    </Text>
                  </View>
                </ScalePressable>
              ) : null}
            </View>

            <ScrollView
              horizontal
              contentContainerStyle={styles.filterScrollerContent}
              showsHorizontalScrollIndicator={false}
            >
              {searchableCategories.map(card => (
                <ExploreFilterChip
                  count={getCategoryCount(card.category)}
                  isActive={
                    selectedCategoryKey === normalizeLookupKey(card.category)
                  }
                  key={card.id}
                  label={card.title}
                  onPress={() => handleSelectCategory(card)}
                  testID={`explore-filter-chip-${card.id}`}
                />
              ))}
            </ScrollView>
          </View>

          {hasProductResults ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{productSectionTitle}</Text>
                <Text style={styles.sectionMeta}>{productSectionMeta}</Text>
              </View>

              <View style={styles.productGrid}>
                {visibleProducts.map(product => (
                  <HomeProductCard
                    key={product.id}
                    imageSource={getProductImage(product.imageKey)}
                    onAddToCart={handleQuickAddToCart}
                    onLongPress={handleOpenQuickActions}
                    onPress={handleOpenProduct}
                    product={product}
                    style={styles.productCardCell}
                  />
                ))}
              </View>
            </>
          ) : null}

          {visibleCategories.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{categorySectionTitle}</Text>
                <Text style={styles.sectionMeta}>
                  {hasSearchQuery
                    ? formatResultCount(
                        visibleCategories.length,
                        'match',
                        'matches',
                      )
                    : formatResultCount(visibleCategories.length, 'aisle')}
                </Text>
              </View>

              {visibleCategories.map(card => (
                <ExploreCategoryCard
                  card={card}
                  isActive={
                    selectedCategoryKey === normalizeLookupKey(card.category)
                  }
                  itemCount={getCategoryCount(card.category)}
                  key={card.id}
                  onPress={handleOpenCategory}
                />
              ))}
            </>
          ) : null}

          {hasNoResults ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateGlyphWrap}>
                <SearchGlyph
                  color={UI_COLORS.accentGreen}
                  style={styles.emptyStateGlyph}
                />
              </View>
              <Text style={styles.emptyStateEyebrow}>Keep exploring</Text>
              <Text style={styles.emptyStateTitle}>{emptyStateTitle}</Text>
              <Text style={styles.emptyStateSubtitle}>
                {emptyStateSubtitle}
              </Text>
              <View style={styles.emptyStateActionWrap}>
                <PrimaryButton
                  onPress={
                    hasSearchQuery
                      ? handleClearSearch
                      : handleClearCategoryFilter
                  }
                  style={styles.emptyStateButton}
                  title={hasSearchQuery ? 'Clear Search' : 'Clear Filter'}
                  variant="secondary"
                />
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
      <ProductQuickActionsSheet
        isFavourite={Boolean(
          selectedQuickActionProduct?.id &&
            isFavourite(selectedQuickActionProduct.id),
        )}
        onAddToCart={handleQuickAddToCart}
        onAddToFavourite={handleAddToFavourite}
        onClose={handleCloseQuickActions}
        onViewDetails={handleOpenProduct}
        product={selectedQuickActionProduct}
        visible={Boolean(selectedQuickActionProduct)}
      />
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
    paddingBottom: UI_LAYOUT.bottomNavContentInset + 48,
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
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 12,
    minHeight: UI_LAYOUT.searchHeight,
    ...UI_SHADOWS.card,
  },
  searchBarFocused: {
    borderColor: '#D7E4D4',
    backgroundColor: UI_COLORS.surfaceWarm,
  },
  searchGlyphWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchGlyphWrapFocused: {
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderColor: '#D7E4D4',
  },
  searchGlyph: {
    width: 18,
    height: 18,
    position: 'relative',
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
  searchHelper: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
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
    marginTop: 14,
    marginBottom: 16,
  },
  resultLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  resultSupportLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  filterPanel: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 16,
    marginBottom: 18,
    ...UI_SHADOWS.card,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterHeaderCopy: {
    flex: 1,
    paddingRight: 12,
  },
  filterTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  filterSubtitle: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  clearFilterButtonShell: {
    marginLeft: 10,
  },
  clearFilterButton: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearFilterButtonLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  filterScrollerContent: {
    paddingRight: 2,
  },
  filterChipShell: {
    marginRight: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderColor: '#D7E4D4',
  },
  filterChipLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    maxWidth: 124,
  },
  filterChipLabelActive: {
    color: UI_COLORS.accentGreen,
  },
  filterChipCount: {
    minWidth: 24,
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surface,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipCountActive: {
    backgroundColor: '#EAF3E8',
  },
  filterChipCountLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  filterChipCountLabelActive: {
    color: UI_COLORS.accentGreen,
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
    backgroundColor: UI_COLORS.surface,
    ...UI_SHADOWS.card,
  },
  categoryCardActive: {
    borderColor: '#C7DABF',
    shadowOpacity: 0.11,
  },
  categoryCardPressed: {
    opacity: 0.98,
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
  categorySelectionPill: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: '#EEF5EB',
    borderWidth: 1,
    borderColor: '#D7E4D4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 10,
  },
  categorySelectionPillLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  categoryIndicator: {
    marginLeft: 2,
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
  categoryFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  categoryActionLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    marginRight: 6,
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
  emptyStateGlyphWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderWidth: 1,
    borderColor: '#D7E4D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyStateGlyph: {
    width: 20,
    height: 20,
  },
  emptyStateEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.42,
    marginBottom: 8,
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
  emptyStateActionWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: UI_SPACING.md,
  },
  emptyStateButton: {
    width: '100%',
    maxWidth: 240,
  },
});

export default ExploreScreen;
