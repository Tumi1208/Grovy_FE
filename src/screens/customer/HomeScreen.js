import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductImageSource } from '../../assets/productImages';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import PrimaryButton from '../../components/PrimaryButton';
import ProductCard from '../../components/ProductCard';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import { getProducts } from '../../services/productService';

const PROMO_BANNER_IMAGE = require('../../assets/images/products/Vegetable-Bag copy.png');

const HOME_COLORS = Object.freeze({
  screen: '#FBF7F2',
  surface: '#FFFFFF',
  text: '#211A16',
  muted: '#8A8178',
  accent: '#D71920',
  banner: '#FDE5D8',
  bannerShape: '#FFD3C6',
  shadow: '#2A160B',
});

function normalizeSearchValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function truncateText(value, limit = 52) {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length <= limit) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, limit).trimEnd()}...`;
}

function LocationPinGlyph() {
  return (
    <View style={styles.locationPin}>
      <View style={styles.locationPinInner} />
    </View>
  );
}

function SearchGlyph({ color = '#312B26' }) {
  return (
    <View style={styles.searchGlyph}>
      <View style={[styles.searchGlyphCircle, { borderColor: color }]} />
      <View style={[styles.searchGlyphHandle, { backgroundColor: color }]} />
    </View>
  );
}

function HomeHeader({
  featuredProduct,
  onChangeSearch,
  onClearSearch,
  onOpenFeaturedProduct,
  onSeeAll,
  searchQuery,
}) {
  const hasSearch = searchQuery.trim().length > 0;
  const bannerTitle = featuredProduct?.name || 'Fresh groceries';
  const bannerSubtitle =
    truncateText(featuredProduct?.description, 56) || 'Daily essentials';

  return (
    <View style={styles.header}>
      <View style={styles.locationRow}>
        <View style={styles.locationInfo}>
          <LocationPinGlyph />
          <View>
            <Text style={styles.locationLabel}>Delivery to</Text>
            <View style={styles.locationValueRow}>
              <Text style={styles.locationValue}>Current location</Text>
              <Text style={styles.locationArrow}>⌄</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.searchBar}>
        <SearchGlyph />
        <TextInput
          onChangeText={onChangeSearch}
          placeholder="Search Store"
          placeholderTextColor="#8D877F"
          style={styles.searchInput}
          value={searchQuery}
        />
        {hasSearch ? (
          <Pressable onPress={onClearSearch} style={styles.clearSearchButton}>
            <Text style={styles.clearSearchButtonLabel}>×</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable
        android_ripple={{ color: '#F7D5C7' }}
        onPress={onOpenFeaturedProduct}
        style={({ pressed }) => [
          styles.promoBanner,
          pressed && styles.promoBannerPressed,
        ]}
      >
        <View style={styles.promoShape} />
        <View style={styles.promoCopy}>
          <Text style={styles.promoEyebrow}>Grovy Picks</Text>
          <Text numberOfLines={2} style={styles.promoTitle}>
            {bannerTitle}
          </Text>
          <Text numberOfLines={2} style={styles.promoSubtitle}>
            {bannerSubtitle}
          </Text>
        </View>

        <Image
          resizeMode="contain"
          source={PROMO_BANNER_IMAGE}
          style={styles.promoImage}
        />
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Product</Text>

        <Pressable onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </Pressable>
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
        <Text style={styles.emptyTitle}>Loading products...</Text>
        <Text style={styles.emptySubtitle}>
          Pulling the latest catalog from the backend.
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
        <Text style={styles.emptyTitle}>No products match your search.</Text>
        <Text style={styles.emptySubtitle}>
          Clear the current keyword to see all products again.
        </Text>
        <View style={styles.emptyActionSpacer} />
        <PrimaryButton
          title="Clear Search"
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
  const { addToCart, totalItems } = useCart();

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

  function handleQuickAddToCart(product) {
    if (!product?.id) {
      return;
    }

    addToCart(product, 1);
  }

  function handleResetFilters() {
    setSearchQuery('');
  }

  function handleOpenExplore() {
    navigation.navigate(CUSTOMER_ROUTES.EXPLORE);
  }

  const normalizedSearchQuery = normalizeSearchValue(searchQuery);
  const filteredProducts = products.filter(product => {
    if (!normalizedSearchQuery) {
      return true;
    }

    return `${product.name} ${product.description} ${product.category}`
      .toLowerCase()
      .includes(normalizedSearchQuery);
  });

  const featuredProduct = products[0] || null;

  function renderProductItem({ item }) {
    return (
      <ProductCard
        imageSource={getProductImageSource(item)}
        onAddToCart={handleQuickAddToCart}
        onPress={handleOpenProduct}
        product={item}
        style={styles.productCardCell}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.screen}>
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
            <HomeHeader
              featuredProduct={featuredProduct}
              onChangeSearch={setSearchQuery}
              onClearSearch={handleResetFilters}
              onOpenFeaturedProduct={() =>
                featuredProduct ? handleOpenProduct(featuredProduct) : null
              }
              onSeeAll={handleOpenExplore}
              searchQuery={searchQuery}
            />
          }
          numColumns={2}
          renderItem={renderProductItem}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />

        <View style={styles.bottomNavWrap}>
          <CustomerBottomNav
            activeRoute={CUSTOMER_ROUTES.HOME}
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
    backgroundColor: HOME_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: HOME_COLORS.screen,
  },
  list: {
    flex: 1,
    backgroundColor: HOME_COLORS.screen,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 132,
  },
  header: {
    paddingTop: 8,
    marginBottom: 8,
  },
  locationRow: {
    marginBottom: 18,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: HOME_COLORS.accent,
    transform: [{ rotate: '45deg' }],
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPinInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: HOME_COLORS.surface,
    transform: [{ rotate: '-45deg' }],
  },
  locationLabel: {
    color: HOME_COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationValue: {
    color: HOME_COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  locationArrow: {
    color: HOME_COLORS.muted,
    fontSize: 18,
    marginLeft: 6,
    marginTop: -2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 18,
    shadowColor: HOME_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.05,
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
    color: HOME_COLORS.text,
    fontSize: 16,
    paddingVertical: 9,
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E4DED6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearSearchButtonLabel: {
    color: '#8D877F',
    fontSize: 18,
    lineHeight: 18,
  },
  promoBanner: {
    backgroundColor: HOME_COLORS.banner,
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 176,
    marginBottom: 24,
    paddingVertical: 20,
    paddingLeft: 20,
    position: 'relative',
  },
  promoBannerPressed: {
    opacity: 0.94,
  },
  promoShape: {
    position: 'absolute',
    right: -22,
    top: -12,
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: HOME_COLORS.bannerShape,
  },
  promoCopy: {
    width: '54%',
    zIndex: 1,
  },
  promoEyebrow: {
    color: '#A35A40',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  promoTitle: {
    color: HOME_COLORS.text,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 8,
  },
  promoSubtitle: {
    color: '#6B625A',
    fontSize: 14,
    lineHeight: 20,
  },
  promoImage: {
    position: 'absolute',
    right: -6,
    bottom: 0,
    width: 190,
    height: 170,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    color: HOME_COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  seeAllText: {
    color: HOME_COLORS.accent,
    fontSize: 14,
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
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    color: HOME_COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: HOME_COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyActionSpacer: {
    height: 16,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
  },
});

export default HomeScreen;
