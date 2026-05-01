import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DirectionalHint from '../../components/DirectionalHint';
import HomeProductCard, {
  HomeCategoryCard,
} from '../../components/home/HomeProductCard';
import ProductQuickActionsSheet from '../../components/ProductQuickActionsSheet';
import {
  HomeBudgetModePanel,
  HomeSmartCollectionRow,
} from '../../components/home/HomeSmartShoppingSections';
import PrimaryButton from '../../components/PrimaryButton';
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
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import { useFavourite } from '../../context/FavouriteContext';
import { buildHomeScreenData } from '../../data/homeScreenData';
import {
  BudgetPresets,
  RecipeBaskets,
  SmartBaskets,
} from '../../data/smartShoppingData';
import { getProducts } from '../../services/productService';
import { normalizeSearchText, productMatchesSearch } from '../../utils/search';
import {
  buildBudgetBasket,
  resolveSmartBasketProducts,
} from '../../utils/smartShoppingHelpers';

const HOME_HORIZONTAL_GAP = 14;
const SMART_BASKET_LIST = Object.values(SmartBaskets);
const BUDGET_PRESET_LIST = Object.values(BudgetPresets);
const RECIPE_BASKET_LIST = Object.values(RecipeBaskets);
const DEFAULT_BUDGET_PRESET_ID =
  BudgetPresets.under20?.id || BUDGET_PRESET_LIST[0]?.id || '';

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

function getHomeSmartCollectionCardWidth(viewportWidth) {
  const availableWidth = Math.max(
    280,
    viewportWidth - UI_LAYOUT.homeScreenPadding * 2,
  );

  return Math.max(234, Math.min(258, Math.round(availableWidth * 0.72)));
}

function getEstimatedTotal(products = []) {
  const total = products.reduce((sum, product) => {
    const price = Number(product?.price);

    return Number.isFinite(price) && price > 0 ? sum + price : sum;
  }, 0);

  return Number(total.toFixed(2));
}

function getAddableProducts(products = []) {
  return products.filter(product => product?.id && product.stock > 0);
}

function buildSmartCollections(products = [], definitions = []) {
  return definitions.map(definition => {
    const { missingKeys, products: resolvedProducts } =
      resolveSmartBasketProducts(products, definition);
    const addableProducts = getAddableProducts(resolvedProducts);

    return {
      ...definition,
      products: addableProducts,
      previewProducts: resolvedProducts,
      estimatedTotal: getEstimatedTotal(addableProducts),
      itemCount: resolvedProducts.length,
      addableCount: addableProducts.length,
      missingCount: missingKeys.length,
      unavailableCount: resolvedProducts.filter(product => product?.stock <= 0)
        .length,
    };
  });
}

function buildBatchAddSummary({ addedCount, missingCount, unavailableCount }) {
  const summary = [
    `Added ${addedCount} item${addedCount === 1 ? '' : 's'} to cart.`,
  ];

  if (missingCount > 0) {
    summary.push(
      `${missingCount} missing item${missingCount === 1 ? '' : 's'} skipped.`,
    );
  }

  if (unavailableCount > 0) {
    summary.push(
      `${unavailableCount} out of stock item${
        unavailableCount === 1 ? '' : 's'
      } skipped.`,
    );
  }

  return summary.join(' ');
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

function SectionHeader({ eyebrow, onSeeAll, subtitle, title }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderCopy}>
        {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {onSeeAll ? (
        <ScalePressable
          android_ripple={{ color: '#E6EEE3' }}
          hitSlop={6}
          onPress={onSeeAll}
          pressScale={0.97}
          style={({ pressed }) => [
            styles.sectionLinkButton,
            pressed && styles.sectionLinkButtonPressed,
          ]}
        >
          <View style={styles.sectionLinkRow}>
            <Text style={styles.sectionLink}>See all</Text>
            <DirectionalHint
              chevronSize={8}
              color={UI_COLORS.mutedStrong}
              mode="plain"
            />
          </View>
        </ScalePressable>
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
          ? 'Refreshing Grovy assistant picks and grocery assortment.'
          : 'Showing your saved assortment while the catalog reconnects.'}
      </Text>
    </View>
  );
}

function HomeHero({ banner, onPress }) {
  const featureChips = ['Smart baskets', 'Budget picks', 'Recipe to cart'];

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroCircleLarge} />
      <View style={styles.heroCircleSmall} />

      <View style={styles.heroCopy}>
        <View style={styles.heroAssistantPill}>
          <Text style={styles.heroAssistantPillLabel}>Grovy assistant</Text>
        </View>
        <Text style={styles.heroTitle}>Shop smarter this week</Text>
        <Text style={styles.heroSubtitle}>
          Build baskets by budget, recipe, or daily grocery needs.
        </Text>

        <View style={styles.heroTagRow}>
          {featureChips.map(tag => (
            <View key={tag} style={styles.heroTag}>
              <Text style={styles.heroTagLabel}>{tag}</Text>
            </View>
          ))}
        </View>

        <ScalePressable
          android_ripple={{ color: '#E6D7C3' }}
          onPress={onPress}
          pressScale={0.98}
          style={({ pressed }) => [
            styles.heroActionButton,
            pressed && styles.heroActionButtonPressed,
          ]}
        >
          <View style={styles.heroActionRow}>
            <Text style={styles.heroActionLabel}>Start smart basket</Text>
            <DirectionalHint
              chevronSize={8}
              color={UI_COLORS.textStrong}
              mode="plain"
              size={20}
            />
          </View>
        </ScalePressable>

        <View style={styles.heroFeaturedCard}>
          <Text style={styles.heroFeaturedEyebrow}>Featured this week</Text>
          <Text numberOfLines={1} style={styles.heroFeaturedTitle}>
            {banner.title}
          </Text>
          <Text numberOfLines={2} style={styles.heroFeaturedSubtitle}>
            {banner.subtitle}
          </Text>
        </View>
      </View>

      <Image
        resizeMode="contain"
        source={banner.imageSource}
        style={styles.heroImage}
      />
    </View>
  );
}

function HomeSectionRow({
  cardWidth,
  items,
  onAddToCart,
  onLongPressProduct,
  onOpenProduct,
}) {
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
          onLongPress={onLongPressProduct}
          onPress={onOpenProduct}
          product={item}
          style={{ width: cardWidth }}
        />
      )}
    />
  );
}

function HomeGroceriesGrid({
  items,
  onAddToCart,
  onLongPressProduct,
  onOpenProduct,
}) {
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
          onLongPress={onLongPressProduct}
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
        <Text style={styles.emptySubtitle}>Please try again in a moment.</Text>
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

function HomeSearchEmptyState({ onResetFilters }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptySubtitle}>
        Try another keyword or clear the search.
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

function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuickActionProduct, setSelectedQuickActionProduct] =
    useState(null);
  const [selectedBudgetPresetId, setSelectedBudgetPresetId] = useState(
    DEFAULT_BUDGET_PRESET_ID,
  );
  const { currentUser } = useApp();
  const { addToCart } = useCart();
  const { addToFavourites, isFavourite } = useFavourite();
  const deliveryLocation =
    currentUser?.location?.shortLabel ||
    currentUser?.location?.label ||
    'HCMC, Vietnam';
  const deliveryLocationMeta =
    currentUser?.location?.source === 'current'
      ? currentUser?.location?.detail
      : '';

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

  function handleAddProductCollection(
    collection,
    {
      emptyMessage = 'No matching products are available right now.',
      title = 'Basket',
    } = {},
  ) {
    const addableProducts = Array.isArray(collection?.products)
      ? collection.products.filter(product => product?.id && product.stock > 0)
      : [];
    const missingCount = Number(collection?.missingCount) || 0;
    const unavailableCount = Number(collection?.unavailableCount) || 0;

    if (!addableProducts.length) {
      Alert.alert(title, emptyMessage);
      return;
    }

    addableProducts.forEach(product => {
      addToCart(product, 1);
    });

    Alert.alert(
      title,
      buildBatchAddSummary({
        addedCount: addableProducts.length,
        missingCount,
        unavailableCount,
      }),
    );
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

  function handleOpenSmartCollection(collection) {
    const previewProduct =
      collection?.previewProducts?.[0] || collection?.products?.[0];

    if (!previewProduct?.id) {
      return;
    }

    handleOpenProduct(previewProduct);
  }

  const homeData = useMemo(() => buildHomeScreenData(products), [products]);
  const smartCollectionCardWidth = useMemo(
    () => getHomeSmartCollectionCardWidth(width),
    [width],
  );
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const hasSearchQuery = Boolean(normalizedSearchQuery);
  const searchResults = hasSearchQuery
    ? products
        .filter(product => productMatchesSearch(product, normalizedSearchQuery))
        .map(product => ({
          ...product,
          imageSource: getProductImage(product.imageKey),
        }))
    : [];
  const horizontalCardWidth = useMemo(
    () => getHomeProductCardWidth(width),
    [width],
  );
  const categoryCardWidth = useMemo(
    () => getHomeCategoryCardWidth(width),
    [width],
  );
  const availableProducts = useMemo(
    () => getAddableProducts(products),
    [products],
  );
  const smartBaskets = useMemo(
    () => buildSmartCollections(products, SMART_BASKET_LIST),
    [products],
  );
  const recipeBaskets = useMemo(
    () => buildSmartCollections(products, RECIPE_BASKET_LIST),
    [products],
  );
  const selectedBudgetPreset =
    BUDGET_PRESET_LIST.find(preset => preset.id === selectedBudgetPresetId) ||
    BUDGET_PRESET_LIST[0] ||
    null;
  const budgetSuggestion = useMemo(
    () =>
      buildBudgetBasket(availableProducts, selectedBudgetPreset?.budget || 0),
    [availableProducts, selectedBudgetPreset],
  );
  const hasCatalogItems = products.length > 0;
  const searchResultsLabel =
    searchResults.length === 1
      ? '1 product'
      : `${searchResults.length} products`;
  const trimmedSearchQuery = searchQuery.trim();
  const shouldShowSmartSections = hasCatalogItems && !hasSearchQuery;

  function handleAddSmartBasket(collection) {
    handleAddProductCollection(collection, {
      title: collection?.title || 'Smart basket',
      emptyMessage: 'No products from this basket are available right now.',
    });
  }

  function handleAddRecipeBasket(collection) {
    handleAddProductCollection(collection, {
      title: collection?.title || 'Recipe to Cart',
      emptyMessage: 'No ingredients from this recipe are available right now.',
    });
  }

  function handleAddBudgetBasket() {
    handleAddProductCollection(
      {
        ...budgetSuggestion,
        title: selectedBudgetPreset?.label || 'Budget basket',
      },
      {
        title: selectedBudgetPreset?.label || 'Budget basket',
        emptyMessage: 'No products fit this budget right now.',
      },
    );
  }

  function handleHeroCtaPress() {
    if (smartBaskets[0]) {
      handleAddSmartBasket(smartBaskets[0]);
      return;
    }

    handleOpenExplore();
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.deliveryCard}>
              <Text style={styles.headerEyebrow}>Delivering to</Text>
              <View style={styles.locationRow}>
                <PinGlyph />
                <Text numberOfLines={1} style={styles.locationLabel}>
                  {deliveryLocation}
                </Text>
              </View>
              {deliveryLocationMeta ? (
                <Text numberOfLines={1} style={styles.locationMeta}>
                  {deliveryLocationMeta}
                </Text>
              ) : null}
            </View>

            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>Smart picks</Text>
            </View>
          </View>

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
              <ScalePressable
                android_ripple={{ color: '#E7DED5' }}
                hitSlop={6}
                onPress={handleResetFilters}
                pressScale={0.94}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.clearButtonPressed,
                ]}
              >
                <Text style={styles.clearButtonLabel}>×</Text>
              </ScalePressable>
            ) : null}
          </View>

          {hasSearchQuery ? (
            <>
              {searchResults.length > 0 ? (
                <View style={styles.searchResultsSection}>
                  <View style={styles.searchResultsHeader}>
                    <View style={styles.searchResultsCopy}>
                      <Text style={styles.sectionTitle}>Search results</Text>
                      <Text style={styles.searchResultsMeta}>
                        {`${searchResultsLabel} for "${trimmedSearchQuery}"`}
                      </Text>
                    </View>
                    <ScalePressable
                      android_ripple={{ color: '#E6EEE3' }}
                      hitSlop={6}
                      onPress={handleResetFilters}
                      pressScale={0.97}
                      style={({ pressed }) => [
                        styles.searchResultsClearButton,
                        pressed && styles.searchResultsClearButtonPressed,
                      ]}
                    >
                      <Text style={styles.searchResultsClearLabel}>
                        Clear Search
                      </Text>
                    </ScalePressable>
                  </View>
                  <HomeGroceriesGrid
                    items={searchResults}
                    onAddToCart={handleQuickAddToCart}
                    onLongPressProduct={handleOpenQuickActions}
                    onOpenProduct={handleOpenProduct}
                  />
                </View>
              ) : isLoading || (errorMessage && !hasCatalogItems) ? (
                <HomeScreenEmptyState
                  errorMessage={errorMessage}
                  hasProducts={hasCatalogItems}
                  isLoading={isLoading}
                  onResetFilters={handleResetFilters}
                  onRetry={handleReloadProducts}
                />
              ) : (
                <HomeSearchEmptyState onResetFilters={handleResetFilters} />
              )}

              <HomeStatusBanner
                errorMessage={errorMessage}
                isLoading={isLoading}
              />
            </>
          ) : (
            <>
              <HomeStatusBanner
                errorMessage={errorMessage}
                isLoading={isLoading}
              />

              <HomeHero banner={homeData.banner} onPress={handleHeroCtaPress} />

              {shouldShowSmartSections ? (
                <>
                  <View style={styles.sectionBlock}>
                    <SectionHeader
                      eyebrow="Smart shopping"
                      subtitle="One-tap grocery bundles for real-life needs."
                      title="Smart Baskets"
                    />
                    <View style={styles.horizontalRail}>
                      <HomeSmartCollectionRow
                        actionLabel="Add basket"
                        cardWidth={smartCollectionCardWidth}
                        items={smartBaskets}
                        onActionPress={handleAddSmartBasket}
                        onPress={handleOpenSmartCollection}
                      />
                    </View>
                  </View>

                  <View style={styles.sectionBlock}>
                    <SectionHeader
                      onSeeAll={handleOpenExplore}
                      subtitle="Jump to the part of the store you need."
                      title="Shop by aisle"
                    />
                    <View style={styles.horizontalRail}>
                      <HomeCategoryRow
                        cardWidth={categoryCardWidth}
                        items={homeData.groceryCategories}
                        onPressCategory={handleOpenCategory}
                      />
                    </View>
                  </View>

                  <View style={styles.sectionBlock}>
                    <SectionHeader
                      subtitle="Let Grovy build a basket around your spending limit."
                      title="Shop by Budget"
                    />
                    <HomeBudgetModePanel
                      budgetPresets={BUDGET_PRESET_LIST}
                      onAddSuggestion={handleAddBudgetBasket}
                      onOpenProduct={handleOpenProduct}
                      onSelectPreset={preset =>
                        setSelectedBudgetPresetId(preset.id)
                      }
                      selectedPreset={selectedBudgetPreset}
                      suggestion={budgetSuggestion}
                    />
                  </View>

                  {homeData.exclusiveOffer.length > 0 ? (
                    <View style={styles.sectionBlock}>
                      <SectionHeader
                        onSeeAll={handleOpenExplore}
                        title="Fresh picks"
                      />
                      <View style={styles.horizontalRail}>
                        <HomeSectionRow
                          cardWidth={horizontalCardWidth}
                          items={homeData.exclusiveOffer}
                          onAddToCart={handleQuickAddToCart}
                          onLongPressProduct={handleOpenQuickActions}
                          onOpenProduct={handleOpenProduct}
                        />
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.sectionBlock}>
                    <SectionHeader
                      subtitle="Choose a meal idea and add ingredients in one tap."
                      title="Recipe to Cart"
                    />
                    <View style={styles.horizontalRail}>
                      <HomeSmartCollectionRow
                        actionLabel="Add ingredients"
                        cardWidth={smartCollectionCardWidth}
                        items={recipeBaskets}
                        onActionPress={handleAddRecipeBasket}
                        onPress={handleOpenSmartCollection}
                        variant="recipe"
                      />
                    </View>
                  </View>

                  {homeData.bestSelling.length > 0 ? (
                    <View style={styles.sectionBlock}>
                      <SectionHeader
                        onSeeAll={handleOpenExplore}
                        subtitle="Popular staples for quick replenishment."
                        title="Popular in store"
                      />
                      <View style={styles.horizontalRail}>
                        <HomeSectionRow
                          cardWidth={horizontalCardWidth}
                          items={homeData.bestSelling}
                          onAddToCart={handleQuickAddToCart}
                          onLongPressProduct={handleOpenQuickActions}
                          onOpenProduct={handleOpenProduct}
                        />
                      </View>
                    </View>
                  ) : null}

                  {homeData.groceries.length > 0 ? (
                    <View style={styles.sectionBlock}>
                      <SectionHeader
                        onSeeAll={handleOpenExplore}
                        subtitle="Reliable essentials for quick lunches and dinners."
                        title="Pantry and protein"
                      />
                      <HomeGroceriesGrid
                        items={homeData.groceries}
                        onAddToCart={handleQuickAddToCart}
                        onLongPressProduct={handleOpenQuickActions}
                        onOpenProduct={handleOpenProduct}
                      />
                    </View>
                  ) : null}
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
            </>
          )}
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
    paddingHorizontal: UI_LAYOUT.homeScreenPadding,
    paddingTop: 12,
    paddingBottom: 150,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  deliveryCard: {
    flex: 1,
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 14,
    marginRight: 12,
    ...UI_SHADOWS.card,
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
  locationMeta: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
    marginLeft: 22,
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
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderWidth: 1,
    borderColor: '#D7E4D4',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  brandBadgeText: {
    color: UI_COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
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
    marginBottom: 6,
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
    marginBottom: 20,
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
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 22,
    minHeight: 290,
    position: 'relative',
    marginBottom: 36,
    ...UI_SHADOWS.card,
  },
  heroCircleLarge: {
    position: 'absolute',
    right: -12,
    bottom: -24,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(231, 238, 220, 0.84)',
  },
  heroCircleSmall: {
    position: 'absolute',
    right: 72,
    top: -26,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(211, 141, 86, 0.16)',
  },
  heroCopy: {
    width: '60%',
    zIndex: 1,
  },
  heroAssistantPill: {
    alignSelf: 'flex-start',
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(255, 253, 252, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.72)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
  },
  heroAssistantPillLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
    maxWidth: '96%',
  },
  heroTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },
  heroTag: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
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
  heroActionButton: {
    alignSelf: 'flex-start',
    borderRadius: 17,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  heroActionButtonPressed: {
    opacity: 0.94,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroActionLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginRight: 6,
  },
  heroFeaturedCard: {
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 253, 250, 0.64)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 250, 0.56)',
    padding: 14,
  },
  heroFeaturedEyebrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 6,
  },
  heroFeaturedTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  heroFeaturedSubtitle: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 4,
  },
  heroImage: {
    position: 'absolute',
    right: 4,
    bottom: 6,
    width: 194,
    height: 172,
  },
  sectionBlock: {
    marginBottom: 34,
  },
  searchResultsSection: {
    marginTop: 18,
    marginBottom: 34,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  searchResultsCopy: {
    flex: 1,
    paddingRight: 12,
  },
  searchResultsMeta: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 4,
  },
  searchResultsClearButton: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderWidth: 1,
    borderColor: '#D7E4D4',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchResultsClearButtonPressed: {
    opacity: 0.88,
  },
  searchResultsClearLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeaderCopy: {
    flex: 1,
    paddingRight: 12,
  },
  sectionEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.42,
    marginBottom: 6,
  },
  sectionTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.sectionTitle,
  },
  sectionSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  sectionLinkButton: {
    marginLeft: 10,
    marginTop: 4,
    paddingVertical: 4,
  },
  sectionLinkButtonPressed: {
    opacity: 0.85,
  },
  sectionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLink: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 2,
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
});

export default HomeScreen;
