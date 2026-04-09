import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getCategoryFallbackImage,
  getProductImageSource,
} from '../../assets/productImages';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import ProductImage from '../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  CUSTOMER_DEMO_PRODUCTS,
  EXPLORE_CATEGORY_CARDS,
} from '../../data/customerTabsData';
import { useCart } from '../../context/CartContext';
import { getProducts } from '../../services/productService';
import { formatCurrency } from '../../utils/formatCurrency';

const EXPLORE_COLORS = Object.freeze({
  screen: '#FCF8F3',
  surface: '#FFFFFF',
  border: '#EEE7DF',
  text: '#211A16',
  muted: '#7F7870',
  accent: '#D71920',
  shadow: '#2A160B',
});

function SearchGlyph({ color = '#7F7870' }) {
  return (
    <View style={styles.searchGlyph}>
      <View style={[styles.searchGlyphCircle, { borderColor: color }]} />
      <View style={[styles.searchGlyphHandle, { backgroundColor: color }]} />
    </View>
  );
}

function ExploreScreen({ navigation }) {
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fruits');
  const [products, setProducts] = useState(CUSTOMER_DEMO_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
          setErrorMessage(
            error.message || 'Could not load products for search.',
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
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return EXPLORE_CATEGORY_CARDS;
    }

    return EXPLORE_CATEGORY_CARDS.filter(card =>
      `${card.title} ${card.category}`.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const visibleProducts = useMemo(() => {
    const categoryMatchedProducts = products.filter(
      product => product.category === selectedCategory,
    );

    if (!normalizedQuery) {
      return categoryMatchedProducts;
    }

    return products.filter(product =>
      `${product.name} ${product.category} ${product.description}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, products, selectedCategory]);

  const showSearchResults = normalizedQuery.length > 0;
  const sectionTitle = showSearchResults ? 'Search Results' : selectedCategory;
  const hasNoProductResults = !isLoading && visibleProducts.length === 0;

  function handleClearSearch() {
    setSearchQuery('');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Find Products</Text>

          <View style={styles.searchBar}>
            <SearchGlyph />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search Store"
              placeholderTextColor={EXPLORE_COLORS.muted}
              style={styles.searchInput}
              value={searchQuery}
            />
            {normalizedQuery ? (
              <Pressable
                android_ripple={{ color: '#EFE8E1' }}
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

          {!showSearchResults ? (
            <View style={styles.categoryGrid}>
              {filteredCategories.map(card => {
                const isSelected = selectedCategory === card.category;

                return (
                  <Pressable
                    key={card.id}
                    android_ripple={{ color: '#EFE8E1' }}
                    onPress={() => setSelectedCategory(card.category)}
                    style={({ pressed }) => [
                      styles.categoryCard,
                      {
                        backgroundColor: card.backgroundColor,
                        borderColor: isSelected
                          ? EXPLORE_COLORS.accent
                          : card.borderColor,
                      },
                      pressed && styles.categoryCardPressed,
                    ]}
                  >
                    <ProductImage
                      name={card.title}
                      resizeMode="contain"
                      source={getCategoryFallbackImage(card.category)}
                      style={styles.categoryImage}
                    />
                    <Text style={styles.categoryLabel}>{card.title}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {!showSearchResults && filteredCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No categories found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try another keyword to browse the category grid.
              </Text>
            </View>
          ) : null}

          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>{sectionTitle}</Text>
            {showSearchResults ? (
              <Text style={styles.resultCount}>{visibleProducts.length} item(s)</Text>
            ) : (
              <Pressable onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}>
                <Text style={styles.previewLink}>Open Shop</Text>
              </Pressable>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={EXPLORE_COLORS.accent} size="small" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>
                {errorMessage} Showing the local demo catalog instead.
              </Text>
            </View>
          ) : null}

          {hasNoProductResults ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No products found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try a different keyword or clear the current search.
              </Text>
              <Pressable
                android_ripple={{ color: '#D1383D' }}
                onPress={handleClearSearch}
                style={({ pressed }) => [
                  styles.emptyStateButton,
                  pressed && styles.emptyStateButtonPressed,
                ]}
              >
                <Text style={styles.emptyStateButtonLabel}>Clear Search</Text>
              </Pressable>
            </View>
          ) : null}

          {!hasNoProductResults &&
            !isLoading &&
            visibleProducts.map(product => (
            <Pressable
              key={product.id}
              android_ripple={{ color: '#F2ECE5' }}
              onPress={() =>
                navigation.navigate(CUSTOMER_ROUTES.PRODUCT_DETAIL, {
                  productId: product.id,
                  initialProduct: product,
                })
              }
              style={({ pressed }) => [
                styles.productRow,
                pressed && styles.productRowPressed,
              ]}
            >
              <View style={styles.productRowImageWrap}>
                <ProductImage
                  name={product.name}
                  resizeMode="contain"
                  source={getProductImageSource(product)}
                  style={styles.productRowImage}
                />
              </View>
              <View style={styles.productRowCopy}>
                <Text numberOfLines={1} style={styles.productRowName}>
                  {product.name}
                </Text>
                <Text numberOfLines={2} style={styles.productRowMeta}>
                  {product.description}
                </Text>
              </View>
              <Text style={styles.productRowPrice}>
                {formatCurrency(product.price)}
              </Text>
            </Pressable>
            ))}
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
    backgroundColor: EXPLORE_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: EXPLORE_COLORS.screen,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 132,
  },
  title: {
    color: EXPLORE_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EXPLORE_COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 22,
    shadowColor: EXPLORE_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
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
    color: EXPLORE_COLORS.text,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8DFD6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  clearSearchButtonPressed: {
    opacity: 0.88,
  },
  clearSearchButtonLabel: {
    color: EXPLORE_COLORS.muted,
    fontSize: 18,
    lineHeight: 18,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  emptyState: {
    backgroundColor: EXPLORE_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: EXPLORE_COLORS.border,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  emptyStateTitle: {
    color: EXPLORE_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: EXPLORE_COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  categoryCard: {
    width: '47.5%',
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 18,
    marginBottom: 14,
  },
  categoryCardPressed: {
    opacity: 0.92,
  },
  categoryImage: {
    width: 88,
    height: 74,
    backgroundColor: 'transparent',
    marginBottom: 14,
  },
  categoryLabel: {
    color: EXPLORE_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    color: EXPLORE_COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  resultCount: {
    color: EXPLORE_COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  previewLink: {
    color: EXPLORE_COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: EXPLORE_COLORS.muted,
    fontSize: 14,
    marginLeft: 10,
  },
  infoBanner: {
    backgroundColor: '#FFF2F2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  infoBannerText: {
    color: EXPLORE_COLORS.accent,
    fontSize: 13,
    lineHeight: 20,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EXPLORE_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: EXPLORE_COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  productRowPressed: {
    opacity: 0.94,
  },
  productRowImageWrap: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#F7F2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  productRowImage: {
    width: 50,
    height: 50,
    backgroundColor: 'transparent',
  },
  productRowCopy: {
    flex: 1,
    marginRight: 12,
  },
  productRowName: {
    color: EXPLORE_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  productRowMeta: {
    color: EXPLORE_COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  productRowPrice: {
    color: EXPLORE_COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyStateButton: {
    marginTop: 16,
    backgroundColor: EXPLORE_COLORS.accent,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  emptyStateButtonPressed: {
    opacity: 0.9,
  },
  emptyStateButtonLabel: {
    color: EXPLORE_COLORS.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
  },
});

export default ExploreScreen;
