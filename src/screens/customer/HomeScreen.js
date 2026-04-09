import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import HomeProductCard, {
  HomeCategoryCard,
} from '../../components/home/HomeProductCard';
import PrimaryButton from '../../components/PrimaryButton';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import {
  buildHomeScreenData,
  filterHomeSectionProducts,
} from '../../data/homeScreenData';
import { getProducts } from '../../services/productService';

const HOME_COLORS = Object.freeze({
  screen: '#FCFCFC',
  surface: '#FFFFFF',
  text: '#181725',
  muted: '#7C7C7C',
  subtle: '#F2F3F2',
  accent: '#53B175',
  banner: '#FDEDDC',
  bannerAccent: '#F8A44C',
  bannerSoft: '#E9F7EE',
  border: '#E2E2E2',
  shadow: '#1F1B17',
});

function normalizeSearchValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function SearchGlyph() {
  return (
    <View style={styles.searchGlyph}>
      <View style={styles.searchGlyphCircle} />
      <View style={styles.searchGlyphHandle} />
    </View>
  );
}

function HomeLogo() {
  return (
    <View style={styles.logoWrap}>
      <View style={styles.logoMark}>
        <View style={styles.logoLeafLeft} />
        <View style={styles.logoLeafRight} />
      </View>
      <Text style={styles.logoText}>Grovy</Text>
    </View>
  );
}

function SectionHeader({ onSeeAll, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll}>
          <Text style={styles.sectionLink}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function HomeBanner({ banner, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#F7D7B7' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.banner,
        pressed && styles.bannerPressed,
      ]}
    >
      <View style={styles.bannerCirclePrimary} />
      <View style={styles.bannerCircleSecondary} />

      <View style={styles.bannerCopy}>
        <Text style={styles.bannerTitle}>{banner.title}</Text>
        <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
      </View>

      <Image
        resizeMode="contain"
        source={banner.imageSource}
        style={styles.bannerImage}
      />
    </Pressable>
  );
}

function HomeSectionRow({
  items,
  onAddToCart,
  onOpenProduct,
}) {
  if (!items.length) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.horizontalSectionContent}
      showsHorizontalScrollIndicator={false}
    >
      {items.map((item, index) => (
        <HomeProductCard
          key={item.id}
          imageSource={item.imageSource}
          onAddToCart={onAddToCart}
          onPress={onOpenProduct}
          product={item}
          style={index === items.length - 1 ? null : styles.productCardSpacing}
        />
      ))}
    </ScrollView>
  );
}

function HomeGroceriesGrid({
  items,
  onAddToCart,
  onOpenProduct,
}) {
  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.groceriesGrid}>
      {items.map((item, index) => (
        <HomeProductCard
          key={item.id}
          imageSource={item.imageSource}
          onAddToCart={onAddToCart}
          onPress={onOpenProduct}
          product={item}
          style={index % 2 === 0 ? styles.groceriesCardLeft : styles.groceriesCardRight}
        />
      ))}
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
        <ActivityIndicator color={HOME_COLORS.accent} size="small" />
        <Text style={styles.emptyTitle}>Loading Home...</Text>
        <Text style={styles.emptySubtitle}>
          Pulling Grovy products and mapping them into the Home frame.
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Could not load Home.</Text>
        <Text style={styles.emptySubtitle}>{errorMessage}</Text>
        <View style={styles.emptySpacer} />
        <PrimaryButton title="Retry" onPress={onRetry} />
      </View>
    );
  }

  if (hasProducts) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No Home items match this search.</Text>
        <Text style={styles.emptySubtitle}>
          Clear the keyword to return to the original Figma-style Home layout.
        </Text>
        <View style={styles.emptySpacer} />
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
        The backend responded successfully, but there is not enough data to fill
        the Home frame.
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

  function handleResetFilters() {
    setSearchQuery('');
  }

  function handleOpenExplore() {
    navigation.navigate(CUSTOMER_ROUTES.EXPLORE);
  }

  const homeData = useMemo(() => buildHomeScreenData(products), [products]);
  const normalizedSearchQuery = normalizeSearchValue(searchQuery);
  const exclusiveOffer = filterHomeSectionProducts(
    homeData.exclusiveOffer,
    normalizedSearchQuery,
  );
  const bestSelling = filterHomeSectionProducts(
    homeData.bestSelling,
    normalizedSearchQuery,
  );
  const groceries = filterHomeSectionProducts(
    homeData.groceries,
    normalizedSearchQuery,
  );
  const hasVisibleContent =
    exclusiveOffer.length > 0 ||
    bestSelling.length > 0 ||
    groceries.length > 0 ||
    !normalizedSearchQuery;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <HomeLogo />
            <Text style={styles.locationLabel}>HCMC, Vietnam</Text>
          </View>

          <View style={styles.searchBar}>
            <SearchGlyph />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search Store"
              placeholderTextColor="#7C7C7C"
              style={styles.searchInput}
              value={searchQuery}
            />
            {searchQuery.trim() ? (
              <Pressable onPress={handleResetFilters} style={styles.clearButton}>
                <Text style={styles.clearButtonLabel}>x</Text>
              </Pressable>
            ) : null}
          </View>

          <HomeBanner
            banner={homeData.banner}
            onPress={() =>
              homeData.exclusiveOffer[0]
                ? handleOpenProduct(homeData.exclusiveOffer[0])
                : null
            }
          />

          {hasVisibleContent ? (
            <>
              <SectionHeader onSeeAll={handleOpenExplore} title="Exclusive Offer" />
              <HomeSectionRow
                items={exclusiveOffer}
                onAddToCart={handleQuickAddToCart}
                onOpenProduct={handleOpenProduct}
              />

              <SectionHeader onSeeAll={handleOpenExplore} title="Best Selling" />
              <HomeSectionRow
                items={bestSelling}
                onAddToCart={handleQuickAddToCart}
                onOpenProduct={handleOpenProduct}
              />

              <SectionHeader onSeeAll={handleOpenExplore} title="Groceries" />
              <ScrollView
                horizontal
                contentContainerStyle={styles.horizontalSectionContent}
                showsHorizontalScrollIndicator={false}
                style={styles.categoryRow}
              >
                {homeData.groceryCategories.map((category, index) => (
                  <HomeCategoryCard
                    key={category.id}
                    category={category}
                    style={
                      index === homeData.groceryCategories.length - 1
                        ? null
                        : styles.categorySpacing
                    }
                  />
                ))}
              </ScrollView>

              <HomeGroceriesGrid
                items={groceries}
                onAddToCart={handleQuickAddToCart}
                onOpenProduct={handleOpenProduct}
              />
            </>
          ) : (
            <HomeScreenEmptyState
              errorMessage={errorMessage}
              hasProducts={products.length > 0}
              isLoading={isLoading}
              onResetFilters={handleResetFilters}
              onRetry={handleReloadProducts}
            />
          )}
        </ScrollView>

        <View style={styles.bottomNavWrap}>
          <CustomerBottomNav
            activeRoute={CUSTOMER_ROUTES.HOME}
            navigation={navigation}
            totalItems={totalItems}
            variant="figma"
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
  content: {
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: 130,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoMark: {
    width: 34,
    height: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 6,
    position: 'relative',
  },
  logoLeafLeft: {
    position: 'absolute',
    left: 6,
    top: 2,
    width: 12,
    height: 18,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#53B175',
    transform: [{ rotate: '-18deg' }],
  },
  logoLeafRight: {
    position: 'absolute',
    right: 6,
    top: 2,
    width: 12,
    height: 18,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#53B175',
    transform: [{ rotate: '18deg' }],
  },
  logoText: {
    color: HOME_COLORS.text,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  locationLabel: {
    color: HOME_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HOME_COLORS.subtle,
    borderRadius: 19,
    paddingHorizontal: 16,
    minHeight: 52,
    marginBottom: 20,
  },
  searchGlyph: {
    width: 18,
    height: 18,
    marginRight: 10,
    position: 'relative',
  },
  searchGlyphCircle: {
    position: 'absolute',
    left: 1,
    top: 1,
    width: 11,
    height: 11,
    borderWidth: 1.8,
    borderRadius: 5.5,
    borderColor: '#181725',
  },
  searchGlyphHandle: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#181725',
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    color: HOME_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 14,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C7C7C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearButtonLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  banner: {
    minHeight: 116,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.banner,
    overflow: 'hidden',
    marginBottom: 28,
    paddingLeft: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  bannerPressed: {
    opacity: 0.95,
  },
  bannerCirclePrimary: {
    position: 'absolute',
    right: 42,
    top: -12,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: HOME_COLORS.bannerAccent,
    opacity: 0.15,
  },
  bannerCircleSecondary: {
    position: 'absolute',
    left: 138,
    bottom: -18,
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: HOME_COLORS.bannerSoft,
  },
  bannerCopy: {
    width: '52%',
    zIndex: 1,
  },
  bannerTitle: {
    color: HOME_COLORS.text,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
  },
  bannerSubtitle: {
    color: '#FC5A5A',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  bannerImage: {
    position: 'absolute',
    right: 8,
    bottom: 0,
    width: 158,
    height: 108,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sectionTitle: {
    color: HOME_COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 29,
  },
  sectionLink: {
    color: HOME_COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  horizontalSectionContent: {
    paddingRight: 25,
  },
  productCardSpacing: {
    marginRight: 15,
  },
  categoryRow: {
    marginBottom: 22,
  },
  categorySpacing: {
    marginRight: 15,
  },
  groceriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  groceriesCardLeft: {
    width: '48%',
  },
  groceriesCardRight: {
    width: '48%',
  },
  emptyCard: {
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
  },
  emptyTitle: {
    color: HOME_COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: HOME_COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptySpacer: {
    height: 16,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 25,
    right: 25,
    bottom: 16,
  },
});

export default HomeScreen;
