import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import HomeProductCard, {
  HomeCategoryCard,
} from '../../components/home/HomeProductCard';
import PrimaryButton from '../../components/PrimaryButton';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_SPACING,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useCart } from '../../context/CartContext';
import {
  buildHomeScreenData,
  filterHomeSectionProducts,
} from '../../data/homeScreenData';
import { getProducts } from '../../services/productService';

const HOME_HORIZONTAL_GAP = 14;

function normalizeSearchValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function getHomeProductCardWidth(viewportWidth) {
  const availableWidth = Math.max(
    280,
    viewportWidth - UI_LAYOUT.homeScreenPadding * 2,
  );

  return Math.max(176, Math.min(196, Math.round(availableWidth * 0.54)));
}

function getHomeCategoryCardWidth(viewportWidth) {
  const availableWidth = Math.max(
    280,
    viewportWidth - UI_LAYOUT.homeScreenPadding * 2,
  );

  return Math.max(228, Math.min(248, Math.round(availableWidth * 0.74)));
}

function SearchGlyph({ color = UI_COLORS.mutedStrong }) {
  return (
    <View style={styles.searchGlyph}>
      <View style={[styles.searchGlyphCircle, { borderColor: color }]} />
      <View style={[styles.searchGlyphHandle, { backgroundColor: color }]} />
    </View>
  );
}

function PinGlyph() {
  return (
    <View style={styles.pinGlyph}>
      <View style={styles.pinGlyphCircle} />
      <View style={styles.pinGlyphPoint} />
    </View>
  );
}

function SectionHeader({ onSeeAll, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll ? (
        <Pressable
          android_ripple={{ color: '#E6EEE3' }}
          hitSlop={6}
          onPress={onSeeAll}
          style={({ pressed }) => [
            styles.sectionLinkButton,
            pressed && styles.sectionLinkButtonPressed,
          ]}
        >
          <Text style={styles.sectionLink}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function HomeRailSpacer() {
  return <View style={styles.horizontalRailSpacer} />;
}

function HomeStatusBanner({ errorMessage, isLoading }) {
  if (!isLoading && !errorMessage) {
    return null;
  }

  return (
    <View
      style={[
        styles.statusBanner,
        errorMessage ? styles.statusBannerWarning : null,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={UI_COLORS.accentGreen} size="small" />
      ) : null}
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
  );
}

function HomeHero({ banner, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#E7DAC8' }}
      onPress={onPress}
      style={({ pressed }) => [styles.heroCard, pressed && styles.heroPressed]}
    >
      <View style={styles.heroCircleLarge} />
      <View style={styles.heroCircleSmall} />

      <View style={styles.heroCopy}>
        <Text style={styles.heroEyebrow}>This week&apos;s basket</Text>
        <Text style={styles.heroTitle}>{banner.title}</Text>
        <Text style={styles.heroSubtitle}>{banner.subtitle}</Text>

        <View style={styles.heroTagRow}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagLabel}>Produce</Text>
          </View>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagLabel}>Pantry</Text>
          </View>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagLabel}>Drinks</Text>
          </View>
        </View>
      </View>

      <Image
        resizeMode="contain"
        source={banner.imageSource}
        style={styles.heroImage}
      />
    </Pressable>
  );
}

function HomeSectionRow({ cardWidth, items, onAddToCart, onOpenProduct }) {
  if (!items.length) {
    return null;
  }

  return (
    <FlatList
      horizontal
      contentContainerStyle={styles.horizontalRailContent}
      data={items}
      decelerationRate="fast"
      disableIntervalMomentum
      ItemSeparatorComponent={HomeRailSpacer}
      keyExtractor={item => item.id}
      nestedScrollEnabled
      snapToAlignment="start"
      snapToInterval={cardWidth + HOME_HORIZONTAL_GAP}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <HomeProductCard
          imageSource={item.imageSource}
          onAddToCart={onAddToCart}
          onPress={onOpenProduct}
          product={item}
          style={{ width: cardWidth }}
        />
      )}
    />
  );
}

function HomeGroceriesGrid({ items, onAddToCart, onOpenProduct }) {
  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.groceriesGrid}>
      {items.map(item => (
        <HomeProductCard
          key={item.id}
          imageSource={item.imageSource}
          onAddToCart={onAddToCart}
          onPress={onOpenProduct}
          product={item}
          style={styles.gridProductCard}
        />
      ))}
    </View>
  );
}

function HomeCategoryRow({ cardWidth, items, onPressCategory }) {
  if (!items.length) {
    return null;
  }

  return (
    <FlatList
      horizontal
      contentContainerStyle={styles.horizontalRailContent}
      data={items}
      decelerationRate="fast"
      disableIntervalMomentum
      ItemSeparatorComponent={HomeRailSpacer}
      keyExtractor={item => item.id}
      nestedScrollEnabled
      snapToAlignment="start"
      snapToInterval={cardWidth + HOME_HORIZONTAL_GAP}
      renderItem={({ item }) => (
        <HomeCategoryCard
          category={item}
          onPress={onPressCategory}
          style={{ width: cardWidth }}
        />
      )}
      showsHorizontalScrollIndicator={false}
    />
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
        <ActivityIndicator color={UI_COLORS.accentGreen} size="small" />
        <Text style={styles.emptyTitle}>Loading the shop</Text>
        <Text style={styles.emptySubtitle}>
          We&apos;re getting the latest grocery items ready.
        </Text>
      </View>
    );
  }

  if (errorMessage && !hasProducts) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Couldn&apos;t load the shop</Text>
        <Text style={styles.emptySubtitle}>
          Please try again in a moment.
        </Text>
        <View style={styles.emptySpacer} />
        <PrimaryButton title="Retry" onPress={onRetry} />
      </View>
    );
  }

  if (hasProducts) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No items match this search</Text>
        <Text style={styles.emptySubtitle}>
          Clear the search to see the full grocery assortment again.
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
      <Text style={styles.emptyTitle}>The shop is quiet right now</Text>
      <Text style={styles.emptySubtitle}>
        There are no grocery items available yet.
      </Text>
    </View>
  );
}

function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
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
            error.message || 'Could not load products right now.',
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

  function handleOpenCategory(category) {
    if (!category?.category) {
      return;
    }

    navigation.navigate(CUSTOMER_ROUTES.CATEGORY_PRODUCTS, {
      category: category.category,
      title: category.title,
    });
  }

  const homeData = useMemo(() => buildHomeScreenData(products), [products]);
  const normalizedSearchQuery = normalizeSearchValue(searchQuery);
  const horizontalCardWidth = useMemo(
    () => getHomeProductCardWidth(width),
    [width],
  );
  const categoryCardWidth = useMemo(
    () => getHomeCategoryCardWidth(width),
    [width],
  );
  const freshPicks = filterHomeSectionProducts(
    homeData.exclusiveOffer,
    normalizedSearchQuery,
  );
  const popularItems = filterHomeSectionProducts(
    homeData.bestSelling,
    normalizedSearchQuery,
  );
  const pantryAndProtein = filterHomeSectionProducts(
    homeData.groceries,
    normalizedSearchQuery,
  );
  const hasCatalogItems =
    homeData.exclusiveOffer.length > 0 ||
    homeData.bestSelling.length > 0 ||
    homeData.groceries.length > 0;
  const hasProductResults =
    freshPicks.length > 0 ||
    popularItems.length > 0 ||
    pantryAndProtein.length > 0;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.headerEyebrow}>Deliver to</Text>
              <View style={styles.locationRow}>
                <PinGlyph />
                <Text style={styles.locationLabel}>HCMC, Vietnam</Text>
              </View>
            </View>

            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>Grovy</Text>
            </View>
          </View>

          <Text style={styles.screenTitle}>Fresh groceries for the week</Text>
          <Text style={styles.screenSubtitle}>
            Produce, pantry basics and drinks in one practical shop.
          </Text>

          <View style={styles.searchBar}>
            <SearchGlyph />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search groceries"
              placeholderTextColor={UI_COLORS.muted}
              style={styles.searchInput}
              value={searchQuery}
            />
            {searchQuery.trim() ? (
              <Pressable
                android_ripple={{ color: '#E7DED5' }}
                hitSlop={6}
                onPress={handleResetFilters}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.clearButtonPressed,
                ]}
              >
                <Text style={styles.clearButtonLabel}>×</Text>
              </Pressable>
            ) : null}
          </View>

          <HomeStatusBanner errorMessage={errorMessage} isLoading={isLoading} />

          <HomeHero
            banner={homeData.banner}
            onPress={() =>
              homeData.exclusiveOffer[0]
                ? handleOpenProduct(homeData.exclusiveOffer[0])
                : null
            }
          />

          <View style={styles.sectionBlock}>
            <SectionHeader onSeeAll={handleOpenExplore} title="Shop by aisle" />
            <View style={styles.horizontalRail}>
              <HomeCategoryRow
                cardWidth={categoryCardWidth}
                items={homeData.groceryCategories}
                onPressCategory={handleOpenCategory}
              />
            </View>
          </View>

          {hasProductResults ? (
            <>
              <View style={styles.sectionBlock}>
                <SectionHeader
                  onSeeAll={handleOpenExplore}
                  title="Fresh picks"
                />
                <View style={styles.horizontalRail}>
                  <HomeSectionRow
                    cardWidth={horizontalCardWidth}
                    items={freshPicks}
                    onAddToCart={handleQuickAddToCart}
                    onOpenProduct={handleOpenProduct}
                  />
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <SectionHeader
                  onSeeAll={handleOpenExplore}
                  title="Popular in store"
                />
                <View style={styles.horizontalRail}>
                  <HomeSectionRow
                    cardWidth={horizontalCardWidth}
                    items={popularItems}
                    onAddToCart={handleQuickAddToCart}
                    onOpenProduct={handleOpenProduct}
                  />
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <SectionHeader
                  onSeeAll={handleOpenExplore}
                  title="Pantry and protein"
                />
                <HomeGroceriesGrid
                  items={pantryAndProtein}
                  onAddToCart={handleQuickAddToCart}
                  onOpenProduct={handleOpenProduct}
                />
              </View>
            </>
          ) : (
            <HomeScreenEmptyState
              errorMessage={errorMessage}
              hasProducts={hasCatalogItems}
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
    paddingHorizontal: UI_LAYOUT.homeScreenPadding,
    paddingTop: 12,
    paddingBottom: 150,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  headerEyebrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginLeft: 8,
  },
  pinGlyph: {
    width: 14,
    height: 18,
    alignItems: 'center',
  },
  pinGlyphCircle: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.8,
    borderColor: UI_COLORS.accentGreen,
  },
  pinGlyphPoint: {
    width: 2,
    height: 5,
    backgroundColor: UI_COLORS.accentGreen,
    borderRadius: 1,
    marginTop: -1,
  },
  brandBadge: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  brandBadgeText: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  screenTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.screenTitle,
  },
  screenSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 6,
    marginBottom: 22,
    maxWidth: '86%',
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
    ...UI_SHADOWS.card,
  },
  searchGlyph: {
    width: 18,
    height: 18,
    marginRight: 12,
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
    paddingVertical: 14,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: UI_COLORS.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearButtonPressed: {
    opacity: 0.88,
  },
  clearButtonLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderRadius: UI_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#D9E6D6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
    marginBottom: 18,
  },
  statusBannerWarning: {
    backgroundColor: UI_COLORS.errorSoft,
    borderColor: '#EBCFC8',
  },
  statusBannerText: {
    color: UI_COLORS.successText,
    ...UI_TYPOGRAPHY.label,
    flex: 1,
    marginLeft: 10,
  },
  statusBannerTextWarning: {
    color: UI_COLORS.accentRed,
  },
  heroCard: {
    backgroundColor: UI_COLORS.banner,
    borderRadius: UI_RADIUS.hero,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    minHeight: 220,
    position: 'relative',
    marginBottom: 36,
  },
  heroPressed: {
    opacity: 0.97,
  },
  heroCircleLarge: {
    position: 'absolute',
    right: -10,
    bottom: -20,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: UI_COLORS.bannerSoft,
  },
  heroCircleSmall: {
    position: 'absolute',
    right: 76,
    top: -24,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(215, 155, 90, 0.16)',
  },
  heroCopy: {
    width: '56%',
    zIndex: 1,
  },
  heroEyebrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 10,
  },
  heroTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 10,
  },
  heroTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  heroTag: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  heroTagLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  heroImage: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 188,
    height: 160,
  },
  sectionBlock: {
    marginBottom: 34,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.sectionTitle,
  },
  sectionLinkButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
  sectionLinkButtonPressed: {
    opacity: 0.85,
  },
  sectionLink: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '700',
  },
  horizontalRail: {
    marginHorizontal: -UI_LAYOUT.homeScreenPadding,
  },
  horizontalRailContent: {
    paddingHorizontal: UI_LAYOUT.homeScreenPadding,
    paddingVertical: 4,
  },
  horizontalRailSpacer: {
    width: HOME_HORIZONTAL_GAP,
  },
  groceriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridProductCard: {
    width: '48%',
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 24,
    alignItems: 'center',
    ...UI_SHADOWS.card,
  },
  emptyTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    textAlign: 'center',
  },
  emptySpacer: {
    height: UI_SPACING.md,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: UI_LAYOUT.homeScreenPadding,
    right: UI_LAYOUT.homeScreenPadding,
    bottom: UI_LAYOUT.bottomNavBottom,
  },
});

export default HomeScreen;
