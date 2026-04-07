import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductImageSource } from '../../assets/productImages';
import PrimaryButton from '../../components/PrimaryButton';
import ProductCard from '../../components/ProductCard';
import { COLORS } from '../../constants/colors';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import { getProducts } from '../../services/productService';

const ALL_CATEGORY = 'All';

function normalizeSearchValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function SearchGlyph() {
  return (
    <View style={styles.searchGlyph} accessibilityElementsHidden importantForAccessibility="no">
      <View style={styles.searchGlyphCircle} />
      <View style={styles.searchGlyphHandle} />
    </View>
  );
}

function CategoryChip({ label, onPress, selected }) {
  return (
    <Pressable
      android_ripple={{ color: '#E6EFE6' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryChip,
        selected && styles.categoryChipSelected,
        pressed && styles.categoryChipPressed,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.categoryChipLabel,
          selected && styles.categoryChipLabelSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HomeScreenHeader({
  categories,
  filteredCount,
  isLoading,
  onChangeSearch,
  onClearSearch,
  onOpenCart,
  onSelectCategory,
  searchQuery,
  selectedCategory,
  totalItems,
  totalProducts,
}) {
  const categoryCount = Math.max(categories.length - 1, 0);
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <View style={styles.header}>
      <View style={styles.heroCard}>
        <View style={styles.heroGlowLarge} />
        <View style={styles.heroGlowSmall} />

        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Fresh everyday picks</Text>
            <Text style={styles.heroTitle}>Build a better grocery basket.</Text>
            <Text style={styles.heroSubtitle}>
              Clean storefront UI on top of the current Grovy backend catalog.
            </Text>
          </View>

          <Pressable
            android_ripple={{ color: '#E7F4EB' }}
            onPress={onOpenCart}
            style={({ pressed }) => [
              styles.cartPill,
              pressed && styles.cartPillPressed,
            ]}
          >
            <Text style={styles.cartValue}>{totalItems}</Text>
            <Text style={styles.cartLabel}>In cart</Text>
          </Pressable>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{totalProducts}</Text>
            <Text style={styles.heroStatLabel}>Products</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{categoryCount}</Text>
            <Text style={styles.heroStatLabel}>Categories</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{filteredCount}</Text>
            <Text style={styles.heroStatLabel}>Showing</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchBar}>
        <SearchGlyph />
        <TextInput
          onChangeText={onChangeSearch}
          placeholder="Search store"
          placeholderTextColor="#8A9488"
          style={styles.searchInput}
          value={searchQuery}
        />
        {hasSearch ? (
          <Pressable onPress={onClearSearch} style={styles.clearSearchButton}>
            <Text style={styles.clearSearchButtonLabel}>x</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.categoryRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {categories.map(category => (
          <CategoryChip
            key={category}
            label={category}
            onPress={() => onSelectCategory(category)}
            selected={selectedCategory === category}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionEyebrow}>Grovy storefront</Text>
          <Text style={styles.sectionTitle}>
            {hasSearch
              ? 'Search results'
              : selectedCategory === ALL_CATEGORY
                ? 'Shop essentials'
                : selectedCategory}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {hasSearch
              ? `Filtered locally from the backend catalog for "${searchQuery.trim()}".`
              : selectedCategory === ALL_CATEGORY
                ? 'Curated groceries with local mapped product images.'
                : `Browse the ${selectedCategory.toLowerCase()} selection from the live catalog.`}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBadge}>
            <Text style={styles.loadingBadgeLabel}>Refreshing</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function HomeScreenEmptyState({
  errorMessage,
  hasProducts,
  isLoading,
  onResetFilters,
  onRetry,
}) {
  if (isLoading) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Loading groceries...</Text>
        <Text style={styles.emptySubtitle}>
          Pulling the latest product list from the Grovy backend.
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Could not load the catalog.</Text>
        <Text style={styles.emptySubtitle}>{errorMessage}</Text>
        <View style={styles.emptyActionSpacer} />
        <PrimaryButton title="Retry" onPress={onRetry} />
      </View>
    );
  }

  if (hasProducts) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No products match that view.</Text>
        <Text style={styles.emptySubtitle}>
          Try another keyword or switch back to all categories.
        </Text>
        <View style={styles.emptyActionSpacer} />
        <PrimaryButton
          title="Clear filters"
          onPress={onResetFilters}
          variant="secondary"
        />
      </View>
    );
  }

  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>No products available yet.</Text>
      <Text style={styles.emptySubtitle}>
        The backend responded successfully, but the catalog is still empty.
      </Text>
    </View>
  );
}

function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const { totalItems } = useCart();

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
          setProducts(items);
        }
      } catch (error) {
        if (isMounted) {
          setProducts([]);
          setErrorMessage(
            error.message || 'Could not load products from the Grovy backend.',
          );
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
  }, [reloadKey]);

  function handleReloadProducts() {
    setReloadKey(currentValue => currentValue + 1);
  }

  useEffect(() => {
    if (
      selectedCategory !== ALL_CATEGORY &&
      !products.some(product => product.category === selectedCategory)
    ) {
      setSelectedCategory(ALL_CATEGORY);
    }
  }, [products, selectedCategory]);

  function handleOpenProduct(product) {
    const normalizedProductId =
      typeof product?.id === 'string' ? product.id.trim() : '';

    if (!normalizedProductId) {
      return;
    }

    navigation.navigate(CUSTOMER_ROUTES.PRODUCT_DETAIL, {
      productId: normalizedProductId,
      initialProduct: product,
    });
  }

  function handleOpenCart() {
    navigation.navigate(CUSTOMER_ROUTES.CART);
  }

  function handleResetFilters() {
    setSearchQuery('');
    setSelectedCategory(ALL_CATEGORY);
  }

  const categories = [
    ALL_CATEGORY,
    ...Array.from(
      new Set(products.map(product => product.category).filter(Boolean)),
    ),
  ];
  const normalizedSearchQuery = normalizeSearchValue(searchQuery);
  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === ALL_CATEGORY || product.category === selectedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedSearchQuery) {
      return true;
    }

    return `${product.name} ${product.category} ${product.description}`
      .toLowerCase()
      .includes(normalizedSearchQuery);
  });

  function renderProductItem({ item }) {
    return (
      <ProductCard
        imageSource={getProductImageSource(item)}
        product={item}
        onPress={handleOpenProduct}
        style={styles.productCardCell}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.content}
        data={filteredProducts}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <HomeScreenEmptyState
            errorMessage={errorMessage}
            hasProducts={products.length > 0}
            isLoading={isLoading}
            onResetFilters={handleResetFilters}
            onRetry={handleReloadProducts}
          />
        }
        ListHeaderComponent={
          <HomeScreenHeader
            categories={categories}
            filteredCount={filteredProducts.length}
            isLoading={isLoading && products.length > 0}
            onChangeSearch={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            onOpenCart={handleOpenCart}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            totalItems={totalItems}
            totalProducts={products.length}
          />
        }
        numColumns={2}
        renderItem={renderProductItem}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F1',
  },
  list: {
    backgroundColor: '#F4F7F1',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 8,
    marginBottom: 8,
  },
  heroCard: {
    backgroundColor: '#1F6A44',
    borderRadius: 32,
    overflow: 'hidden',
    padding: 22,
    marginBottom: 18,
  },
  heroGlowLarge: {
    position: 'absolute',
    top: -52,
    right: -24,
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroGlowSmall: {
    position: 'absolute',
    bottom: -40,
    left: -18,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 12,
  },
  heroEyebrow: {
    color: '#D7F2E3',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: COLORS.surface,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 37,
    marginBottom: 10,
  },
  heroSubtitle: {
    color: '#E8FFF2',
    fontSize: 15,
    lineHeight: 22,
  },
  cartPill: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    minWidth: 88,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cartPillPressed: {
    opacity: 0.92,
  },
  cartValue: {
    color: '#1F6A44',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  cartLabel: {
    color: '#5C6C63',
    fontSize: 12,
    fontWeight: '600',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroStatLabel: {
    color: '#D7F2E3',
    fontSize: 12,
  },
  heroStatDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginHorizontal: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E8DA',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#112218',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  searchGlyph: {
    width: 20,
    height: 20,
    marginRight: 12,
    position: 'relative',
  },
  searchGlyphCircle: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4A5A4F',
  },
  searchGlyphHandle: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 7,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#4A5A4F',
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 10,
  },
  clearSearchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearSearchButtonLabel: {
    color: '#647166',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  categoryRow: {
    paddingBottom: 10,
    paddingRight: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DFE6D9',
    marginRight: 10,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChipSelected: {
    backgroundColor: '#203F30',
    borderColor: '#203F30',
  },
  categoryChipPressed: {
    opacity: 0.92,
  },
  categoryChipLabel: {
    color: '#4E5D52',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipLabelSelected: {
    color: COLORS.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 18,
  },
  sectionCopy: {
    flex: 1,
    paddingRight: 16,
  },
  sectionEyebrow: {
    color: '#6E7D73',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: '#1B2A20',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: '#6B786E',
    fontSize: 14,
    lineHeight: 21,
  },
  loadingBadge: {
    backgroundColor: '#E4F2E8',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loadingBadgeLabel: {
    color: '#1F6A44',
    fontSize: 12,
    fontWeight: '700',
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCardCell: {
    flexBasis: '48%',
    maxWidth: '48%',
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyActionSpacer: {
    height: 16,
  },
});

export default HomeScreen;
