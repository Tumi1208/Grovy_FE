import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import DirectionalHint from '../../components/DirectionalHint';
import ChevronIcon from '../../components/icons/ChevronIcon';
import PrimaryButton from '../../components/PrimaryButton';
import ProductImage from '../../components/ProductImage';
import ScalePressable from '../../components/ScalePressable';
import { getProductImage } from '../../constants/productImages';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_MOTION,
  UI_RADIUS,
  UI_SHADOWS,
  UI_SPACING,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useCart } from '../../context/CartContext';
import { useFavourite } from '../../context/FavouriteContext';
import { getProductDetailById } from '../../services/productService';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductSubtitle } from '../../utils/productPresentation';

const MIN_QUANTITY = 1;
const HERO_ENTRANCE_OFFSET = 18;
const CONTENT_ENTRANCE_OFFSET = 22;
const FOOTER_ENTRANCE_OFFSET = 20;

const PRODUCT_ASSISTANT_SUGGESTIONS = Object.freeze({
  fruits: {
    title: 'Complete this basket',
    description:
      'Pair fruit with breakfast staples or juice for a faster morning shop.',
    ctaCategory: 'Dairy and Eggs',
    ctaTitle: 'Dairy & eggs',
    ctaLabel: 'Browse breakfast basics',
    tags: ['Breakfast', 'Fresh start'],
  },
  vegetables: {
    title: 'Pairs well with',
    description:
      'Add pantry basics and protein to turn this into a quick meal basket.',
    ctaCategory: 'Pantry',
    ctaTitle: 'Pantry',
    ctaLabel: 'Browse pantry staples',
    tags: ['Meal prep', 'Dinner'],
  },
  pantry: {
    title: 'Complete this basket',
    description:
      'Pantry items work best with produce and protein for a more balanced cart.',
    ctaCategory: 'Vegetables',
    ctaTitle: 'Vegetables',
    ctaLabel: 'Add fresh vegetables',
    tags: ['Balanced', 'Essentials'],
  },
  beverages: {
    title: 'Pairs well with',
    description:
      'Match drinks with fruit or breakfast staples for an easy top-up basket.',
    ctaCategory: 'Fruits',
    ctaTitle: 'Fresh fruits',
    ctaLabel: 'Browse fresh fruits',
    tags: ['Breakfast', 'Refresh'],
  },
  meat: {
    title: 'Complete this basket',
    description:
      'Add vegetables or pantry staples to build a simple lunch or dinner plan.',
    ctaCategory: 'Vegetables',
    ctaTitle: 'Vegetables',
    ctaLabel: 'Add vegetables',
    tags: ['Dinner', 'Protein'],
  },
  dairyandeggs: {
    title: 'Pairs well with',
    description:
      'Round this out with fruit or pantry staples for quick breakfasts and snacks.',
    ctaCategory: 'Fruits',
    ctaTitle: 'Fresh fruits',
    ctaLabel: 'Browse fresh fruits',
    tags: ['Morning', 'Easy'],
  },
});

function normalizeRouteProductId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeLookupKey(value) {
  return typeof value === 'string' && value.trim()
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
    : '';
}

function getProductAssistantSuggestion(product = {}) {
  return (
    PRODUCT_ASSISTANT_SUGGESTIONS[normalizeLookupKey(product.category)] || null
  );
}

function buildProductMetaLabels(product = {}, fallbackSubtitle = '') {
  const unitSizeLabel = [product.unit, product.size]
    .filter(Boolean)
    .join(' · ');

  return [unitSizeLabel, fallbackSubtitle]
    .map(label => (typeof label === 'string' ? label.trim() : ''))
    .filter(Boolean)
    .filter(
      (label, index, labels) =>
        index ===
        labels.findIndex(
          candidate =>
            normalizeLookupKey(candidate) === normalizeLookupKey(label),
        ),
    )
    .slice(0, 2);
}

function HeaderButton({ children, onPress, style, testID }) {
  return (
    <ScalePressable
      android_ripple={{ color: '#EDE5DB' }}
      onPress={onPress}
      pressScale={0.94}
      style={({ pressed }) => [
        styles.headerButton,
        style,
        pressed && styles.headerButtonPressed,
      ]}
      testID={testID}
    >
      {children}
    </ScalePressable>
  );
}

function QuantityButton({
  disabled = false,
  isAccent = false,
  label,
  onPress,
  testID,
}) {
  return (
    <ScalePressable
      android_ripple={{ color: '#EFE7DD' }}
      disabled={disabled}
      onPress={onPress}
      pressScale={0.94}
      style={({ pressed }) => [
        styles.quantityButton,
        isAccent && styles.quantityButtonAccent,
        disabled && styles.quantityButtonDisabled,
        pressed && !disabled && styles.quantityButtonPressed,
        pressed && !disabled && isAccent && styles.quantityButtonPressedAccent,
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.quantityButtonLabel,
          isAccent && styles.quantityButtonLabelAccent,
        ]}
      >
        {label}
      </Text>
    </ScalePressable>
  );
}

function DetailRow({
  expanded = false,
  isLast = false,
  onPress,
  subtitle,
  title,
  value,
}) {
  return (
    <ScalePressable
      android_ripple={{ color: '#EFE8DE' }}
      onPress={onPress}
      pressScale={0.985}
      style={({ pressed }) => [
        styles.detailRow,
        isLast && styles.detailRowLast,
        pressed && styles.detailRowPressed,
      ]}
    >
      <View style={styles.detailRowHeader}>
        <Text style={styles.detailRowTitle}>{title}</Text>
        <View style={styles.detailRowRight}>
          {value ? (
            <View style={styles.detailRowValuePill}>
              <Text style={styles.detailRowValue}>{value}</Text>
            </View>
          ) : null}
          <DirectionalHint
            chevronSize={8}
            color={UI_COLORS.mutedStrong}
            direction={expanded ? 'down' : 'right'}
            mode="plain"
            strokeWidth={1.55}
            style={styles.detailRowIndicator}
          />
        </View>
      </View>

      {expanded && subtitle ? (
        <Text style={styles.detailRowSubtitle}>{subtitle}</Text>
      ) : null}
    </ScalePressable>
  );
}

function ProductDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initialProduct = route.params?.initialProduct || null;
  const productId =
    normalizeRouteProductId(route.params?.productId) ||
    normalizeRouteProductId(initialProduct?.id);
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedSection, setExpandedSection] = useState('details');
  const { addToCart, totalItems } = useCart();
  const { isFavourite, toggleFavourite } = useFavourite();
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(
    new Animated.Value(HERO_ENTRANCE_OFFSET),
  ).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(
    new Animated.Value(CONTENT_ENTRANCE_OFFSET),
  ).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(
    new Animated.Value(FOOTER_ENTRANCE_OFFSET),
  ).current;
  const imageScale = useRef(new Animated.Value(0.96)).current;
  const quantityScale = useRef(new Animated.Value(1)).current;
  const previousQuantityRef = useRef(MIN_QUANTITY);

  useEffect(() => {
    setQuantity(MIN_QUANTITY);
    setExpandedSection('details');
    previousQuantityRef.current = MIN_QUANTITY;
  }, [productId]);

  useEffect(() => {
    let isMounted = true;

    async function loadProductDetail() {
      if (!productId) {
        if (isMounted) {
          setProduct(initialProduct);
          setError('No product was selected.');
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setProduct(initialProduct);
        setError('');
        setLoading(true);
      }

      try {
        const productDetail = await getProductDetailById(productId);

        if (isMounted) {
          setProduct(productDetail);
        }
      } catch (loadError) {
        if (isMounted) {
          setProduct(initialProduct);
          setError(loadError.message || 'Could not load this product.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProductDetail();

    return () => {
      isMounted = false;
    };
  }, [initialProduct, productId, reloadKey]);

  useEffect(() => {
    if (!product?.id) {
      return undefined;
    }

    heroOpacity.stopAnimation();
    heroTranslateY.stopAnimation();
    contentOpacity.stopAnimation();
    contentTranslateY.stopAnimation();
    footerOpacity.stopAnimation();
    footerTranslateY.stopAnimation();
    imageScale.stopAnimation();

    heroOpacity.setValue(0);
    heroTranslateY.setValue(HERO_ENTRANCE_OFFSET);
    contentOpacity.setValue(0);
    contentTranslateY.setValue(CONTENT_ENTRANCE_OFFSET);
    footerOpacity.setValue(0);
    footerTranslateY.setValue(FOOTER_ENTRANCE_OFFSET);
    imageScale.setValue(0.96);

    const entranceAnimation = Animated.stagger(55, [
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: UI_MOTION.slow,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(heroTranslateY, {
          toValue: 0,
          duration: UI_MOTION.slow,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 1,
          duration: UI_MOTION.slow,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: UI_MOTION.slow,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: UI_MOTION.slow,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: UI_MOTION.normal,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(footerTranslateY, {
          toValue: 0,
          duration: UI_MOTION.normal,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    entranceAnimation.start();

    return () => {
      entranceAnimation.stop();
    };
  }, [
    contentOpacity,
    contentTranslateY,
    footerOpacity,
    footerTranslateY,
    heroOpacity,
    heroTranslateY,
    imageScale,
    product?.id,
  ]);

  useEffect(() => {
    if (previousQuantityRef.current === quantity) {
      return;
    }

    previousQuantityRef.current = quantity;
    quantityScale.stopAnimation();
    quantityScale.setValue(0.92);

    Animated.spring(quantityScale, {
      toValue: 1,
      damping: 10,
      mass: 0.7,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  }, [quantity, quantityScale]);

  function handleBack() {
    if (typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(CUSTOMER_ROUTES.HOME);
  }

  function handleRetry() {
    setReloadKey(currentValue => currentValue + 1);
  }

  function handleDecreaseQuantity() {
    setQuantity(currentValue => Math.max(MIN_QUANTITY, currentValue - 1));
  }

  function handleIncreaseQuantity() {
    if (product?.stock <= 0) {
      return;
    }

    const maxQuantity = product.stock;

    setQuantity(currentValue => Math.min(maxQuantity, currentValue + 1));
  }

  function handleToggleSection(sectionKey) {
    setExpandedSection(currentValue =>
      currentValue === sectionKey ? '' : sectionKey,
    );
  }

  function handleAddToCart() {
    if (!product || product.stock <= 0) {
      return;
    }

    addToCart(product, quantity);
    navigation.navigate(CUSTOMER_ROUTES.CART);
  }

  if (loading && !product) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.centeredState}>
          <ActivityIndicator color={UI_COLORS.accentGreen} size="large" />
          <Text style={styles.stateTitle}>Loading product</Text>
          <Text style={styles.stateDescription}>
            We&apos;re getting the latest details ready.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.centeredState}>
          <Text style={styles.stateTitle}>This product is unavailable</Text>
          <Text style={styles.stateDescription}>
            {error || 'The selected product could not be found.'}
          </Text>
          <View style={styles.stateSpacer} />
          <PrimaryButton title="Retry" onPress={handleRetry} />
          <View style={styles.buttonSpacer} />
          <PrimaryButton
            title="Back to shop"
            onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const imageSource = getProductImage(product?.imageKey);
  const isOutOfStock = product.stock <= 0;
  const isIncreaseDisabled =
    isOutOfStock || (product.stock > 0 && quantity >= product.stock);
  const productSubtitle = getProductSubtitle(product);
  const productMetaLabels = buildProductMetaLabels(product, productSubtitle);
  const totalPriceLabel = formatCurrency(product.price * quantity);
  const favouriteActive = isFavourite(product.id);
  const nutritionValue =
    product.category?.toLowerCase() === 'beverages' ? '100 ml' : '100 g';
  const nutritionDescription =
    'Nutrition details will appear here when available.';
  const assistantSuggestion = getProductAssistantSuggestion(product);
  const footerBottomOffset = Math.max(
    UI_LAYOUT.footerBottom,
    insets.bottom + 8,
  );
  const stickyCtaLabel = isOutOfStock
    ? 'Unavailable today'
    : `Add ${quantity} to Cart · ${totalPriceLabel}`;
  const selectedQuantityLabel = `${quantity} item${quantity === 1 ? '' : 's'}`;
  const summaryDescription = product.description || 'No description available.';
  const contentContainerStyle = [
    styles.content,
    { paddingBottom: footerBottomOffset + 112 },
  ];
  const animatedHeroStyle = {
    opacity: heroOpacity,
    transform: [{ translateY: heroTranslateY }],
  };
  const animatedImageStyle = {
    transform: [{ scale: imageScale }],
  };
  const animatedContentStyle = {
    opacity: contentOpacity,
    transform: [{ translateY: contentTranslateY }],
  };
  const animatedFooterStyle = {
    opacity: footerOpacity,
    transform: [{ translateY: footerTranslateY }],
  };
  const animatedQuantityStyle = {
    transform: [{ scale: quantityScale }],
  };

  function handleOpenAssistantSuggestion() {
    if (!assistantSuggestion?.ctaCategory) {
      return;
    }

    navigation.navigate(CUSTOMER_ROUTES.CATEGORY_PRODUCTS, {
      category: assistantSuggestion.ctaCategory,
      title: assistantSuggestion.ctaTitle || assistantSuggestion.ctaCategory,
    });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar
        backgroundColor={UI_COLORS.screenLight}
        barStyle="dark-content"
      />
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <HeaderButton onPress={handleBack} testID="product-detail-back">
            <ChevronIcon
              color={UI_COLORS.textStrong}
              direction="left"
              size={12}
              strokeWidth={1.9}
            />
          </HeaderButton>

          <HeaderButton
            onPress={() => navigation.navigate(CUSTOMER_ROUTES.CART)}
            style={styles.cartButton}
          >
            <Text style={styles.cartButtonLabel}>Cart</Text>
            {totalItems > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeLabel}>{totalItems}</Text>
              </View>
            ) : null}
          </HeaderButton>
        </View>

        <ScrollView
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.infoBanner}>
              <ActivityIndicator color={UI_COLORS.accentGreen} size="small" />
              <Text style={styles.infoBannerText}>
                Refreshing the latest item details.
              </Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>
                Showing the available item details while we reconnect.
              </Text>
            </View>
          ) : null}

          <Animated.View style={[styles.heroCard, animatedHeroStyle]}>
            <View style={styles.heroToneLarge} />
            <View style={styles.heroToneSmall} />
            <View style={styles.heroTopRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillLabel}>{product.category}</Text>
              </View>

              <ScalePressable
                android_ripple={{ color: '#EDE5DB' }}
                onPress={() => toggleFavourite(product)}
                pressScale={0.94}
                style={({ pressed }) => [
                  styles.favouriteButton,
                  favouriteActive && styles.favouriteButtonActive,
                  pressed && styles.favouriteButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.favouriteIcon,
                    favouriteActive && styles.favouriteIconActive,
                  ]}
                >
                  {favouriteActive ? '♥' : '♡'}
                </Text>
              </ScalePressable>
            </View>

            <Animated.View
              style={[styles.productImageFrame, animatedImageStyle]}
            >
              <View style={styles.productImageGlow} />
              <ProductImage
                name={product.name}
                resizeMode="contain"
                source={imageSource}
                style={styles.productImage}
              />
            </Animated.View>
          </Animated.View>

          <Animated.View style={animatedContentStyle}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryMetaRow}>
                <View
                  style={[
                    styles.metaPill,
                    isOutOfStock
                      ? styles.metaPillWarning
                      : styles.metaPillSuccess,
                  ]}
                >
                  <Text
                    style={[
                      styles.metaPillLabel,
                      isOutOfStock
                        ? styles.metaPillLabelWarning
                        : styles.metaPillLabelSuccess,
                    ]}
                  >
                    {isOutOfStock
                      ? 'Out of stock'
                      : `${product.stock} in stock`}
                  </Text>
                </View>
                <Text style={styles.summaryMetaText}>
                  {isOutOfStock
                    ? 'Currently unavailable for checkout.'
                    : 'Fresh and ready for your cart today.'}
                </Text>
              </View>

              <Text style={styles.productName}>{product.name}</Text>

              {productMetaLabels.length > 0 ? (
                <View style={styles.productMetaChipRow}>
                  {productMetaLabels.map(label => (
                    <View key={label} style={styles.productMetaChip}>
                      <Text style={styles.productMetaChipLabel}>{label}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <Text numberOfLines={3} style={styles.productDescription}>
                {summaryDescription}
              </Text>

              <View style={styles.purchasePanel}>
                <View style={styles.priceRow}>
                  <View style={styles.priceBlock}>
                    <Text style={styles.priceCaption}>Price</Text>
                    <Text style={styles.priceValue}>
                      {formatCurrency(product.price)}
                    </Text>
                    <Text style={styles.priceSupportText}>
                      {productMetaLabels[0] || 'Per item'}
                    </Text>
                  </View>

                  <View style={styles.quantityBlock}>
                    <Text style={styles.quantityCaption}>Quantity</Text>
                    <View style={styles.quantityStepper}>
                      <QuantityButton
                        disabled={isOutOfStock || quantity <= MIN_QUANTITY}
                        label="-"
                        onPress={handleDecreaseQuantity}
                        testID="product-detail-quantity-decrease"
                      />
                      <Animated.View
                        style={[
                          styles.quantityValueBadge,
                          animatedQuantityStyle,
                        ]}
                      >
                        <Text
                          style={styles.quantityValue}
                          testID="product-detail-quantity-value"
                        >
                          {quantity}
                        </Text>
                      </Animated.View>
                      <QuantityButton
                        disabled={isIncreaseDisabled}
                        isAccent
                        label="+"
                        onPress={handleIncreaseQuantity}
                        testID="product-detail-quantity-increase"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {assistantSuggestion ? (
              <ScalePressable
                android_ripple={{ color: '#EEE5D8' }}
                onPress={handleOpenAssistantSuggestion}
                pressScale={0.99}
                style={({ pressed }) => [
                  styles.assistantCard,
                  pressed && styles.assistantCardPressed,
                ]}
              >
                <View style={styles.assistantCardHeader}>
                  <View style={styles.assistantCardCopy}>
                    <Text style={styles.assistantCardEyebrow}>
                      Smart suggestion
                    </Text>
                    <Text style={styles.assistantCardTitle}>
                      {assistantSuggestion.title}
                    </Text>
                  </View>
                  <DirectionalHint
                    chevronSize={8}
                    color={UI_COLORS.mutedStrong}
                    mode="plain"
                    size={22}
                  />
                </View>

                <Text style={styles.assistantCardDescription}>
                  {assistantSuggestion.description}
                </Text>

                <View style={styles.assistantTagRow}>
                  {assistantSuggestion.tags?.map(tag => (
                    <View key={tag} style={styles.assistantTag}>
                      <Text style={styles.assistantTagLabel}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.assistantCardFooter}>
                  {assistantSuggestion.ctaTitle ? (
                    <View style={styles.assistantDestinationPill}>
                      <Text style={styles.assistantDestinationPillLabel}>
                        {assistantSuggestion.ctaTitle}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={styles.assistantCardAction}>
                    {assistantSuggestion.ctaLabel}
                  </Text>
                </View>
              </ScalePressable>
            ) : null}

            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Product information</Text>

              <DetailRow
                expanded={expandedSection === 'details'}
                onPress={() => handleToggleSection('details')}
                subtitle={summaryDescription}
                title="About this item"
              />
              <DetailRow
                expanded={expandedSection === 'nutrition'}
                onPress={() => handleToggleSection('nutrition')}
                subtitle={nutritionDescription}
                title="Nutrition"
                value={nutritionValue}
              />
              <DetailRow
                expanded={expandedSection === 'reviews'}
                isLast
                onPress={() => handleToggleSection('reviews')}
                subtitle="Customer reviews will show here once this item has ratings."
                title="Reviews"
                value="0"
              />
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View
          style={[
            styles.footer,
            { bottom: footerBottomOffset },
            animatedFooterStyle,
          ]}
        >
          <View style={styles.footerSummary}>
            <Text style={styles.footerSummaryLabel}>Selected</Text>
            <Text style={styles.footerSummaryValue}>
              {selectedQuantityLabel}
            </Text>
          </View>

          <ScalePressable
            android_ripple={{ color: '#3B5B37' }}
            disabled={isOutOfStock}
            onPress={handleAddToCart}
            pressScale={0.985}
            style={({ pressed }) => [
              styles.addToCartButton,
              isOutOfStock && styles.addToCartButtonDisabled,
              pressed && !isOutOfStock && styles.addToCartButtonPressed,
            ]}
            testID="product-detail-add-to-cart"
          >
            <View style={styles.addToCartButtonContent}>
              <Text
                numberOfLines={1}
                style={[
                  styles.addToCartTitle,
                  isOutOfStock && styles.addToCartTitleDisabled,
                ]}
                testID="product-detail-add-to-cart-label"
              >
                {stickyCtaLabel}
              </Text>
              <Text
                style={[
                  styles.addToCartSubtitle,
                  isOutOfStock && styles.addToCartSubtitleDisabled,
                ]}
              >
                {isOutOfStock
                  ? 'Check back after the next restock.'
                  : 'Tap to add and open your cart.'}
              </Text>
            </View>
          </ScalePressable>
        </Animated.View>
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
    paddingTop: 2,
    paddingBottom: 144,
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: UI_LAYOUT.screenPadding,
  },
  stateTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  stateDescription: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    textAlign: 'center',
  },
  stateSpacer: {
    height: UI_SPACING.xl,
  },
  buttonSpacer: {
    height: UI_SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerButton: {
    minWidth: UI_LAYOUT.iconButton,
    height: UI_LAYOUT.iconButton,
    borderRadius: UI_RADIUS.lg,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  headerButtonPressed: {
    opacity: 0.94,
  },
  backIcon: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
  },
  cartButton: {
    flexDirection: 'row',
  },
  cartButtonLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  cartBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: UI_COLORS.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  cartBadgeLabel: {
    color: UI_COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderRadius: UI_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#D7E3D5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  infoBannerText: {
    color: UI_COLORS.successText,
    ...UI_TYPOGRAPHY.label,
    flex: 1,
    marginLeft: 10,
  },
  errorBanner: {
    backgroundColor: UI_COLORS.errorSoft,
    borderRadius: UI_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#EBCFC8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  errorBannerText: {
    color: UI_COLORS.accentRed,
    ...UI_TYPOGRAPHY.label,
    lineHeight: 18,
  },
  heroCard: {
    backgroundColor: UI_COLORS.hero,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#DEE4D7',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    ...UI_SHADOWS.card,
  },
  heroToneLarge: {
    position: 'absolute',
    right: -34,
    bottom: -36,
    width: 212,
    height: 212,
    borderRadius: 106,
    backgroundColor: 'rgba(215, 155, 90, 0.14)',
  },
  heroToneSmall: {
    position: 'absolute',
    left: -24,
    top: 74,
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(84, 122, 78, 0.1)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryPill: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  favouriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.44)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favouriteButtonActive: {
    backgroundColor: UI_COLORS.accentRedSoft,
  },
  favouriteButtonPressed: {
    opacity: 0.92,
  },
  favouriteIcon: {
    color: UI_COLORS.mutedStrong,
    fontSize: 18,
    lineHeight: 18,
  },
  favouriteIconActive: {
    color: UI_COLORS.accentRed,
  },
  productImageFrame: {
    minHeight: 312,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  productImageGlow: {
    position: 'absolute',
    width: 216,
    height: 216,
    borderRadius: 108,
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
  },
  productImage: {
    width: '100%',
    height: 276,
    zIndex: 1,
  },
  summaryCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 24,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaPill: {
    borderRadius: UI_RADIUS.round,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  metaPillSuccess: {
    backgroundColor: UI_COLORS.accentGreenSoft,
  },
  metaPillWarning: {
    backgroundColor: UI_COLORS.accentRedSoft,
  },
  metaPillLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  metaPillLabelSuccess: {
    color: UI_COLORS.accentGreen,
  },
  metaPillLabelWarning: {
    color: UI_COLORS.accentRed,
  },
  summaryMetaText: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12.5,
    lineHeight: 18,
    marginLeft: 12,
    flex: 1,
    textAlign: 'right',
  },
  productName: {
    color: UI_COLORS.textStrong,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 37,
  },
  productMetaChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
  },
  productMetaChip: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  productMetaChipLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  productDescription: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginBottom: 22,
  },
  purchasePanel: {
    backgroundColor: UI_COLORS.surfaceWarm,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    padding: 16,
  },
  assistantCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  assistantCardPressed: {
    opacity: 0.97,
  },
  assistantCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  assistantCardCopy: {
    flex: 1,
    paddingRight: 12,
  },
  assistantCardEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.42,
    marginBottom: 6,
  },
  assistantCardTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  assistantCardDescription: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 10,
  },
  assistantTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  assistantTag: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  assistantTagLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  assistantCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  assistantDestinationPill: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.accentSoft,
    borderWidth: 1,
    borderColor: '#EBCFB7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 12,
  },
  assistantDestinationPillLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  assistantCardAction: {
    color: UI_COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    flex: 1,
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceBlock: {
    flex: 1,
    paddingRight: 14,
  },
  priceCaption: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 8,
  },
  priceValue: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.priceLarge,
  },
  priceSupportText: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 6,
  },
  quantityBlock: {
    alignItems: 'flex-end',
    minWidth: 168,
  },
  quantityCaption: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 8,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  quantityButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonAccent: {
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderColor: '#D7E3D5',
  },
  quantityButtonPressed: {
    opacity: 0.95,
  },
  quantityButtonPressedAccent: {
    backgroundColor: '#DCE8D6',
  },
  quantityButtonDisabled: {
    opacity: 0.42,
  },
  quantityButtonLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
  },
  quantityButtonLabelAccent: {
    color: UI_COLORS.accentGreen,
  },
  quantityValueBadge: {
    minWidth: 48,
    borderRadius: 14,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    overflow: 'hidden',
    marginBottom: 4,
    ...UI_SHADOWS.card,
  },
  detailsTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  detailRow: {
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: UI_COLORS.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailRowPressed: {
    opacity: 0.98,
  },
  detailRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailRowTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '700',
  },
  detailRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailRowValuePill: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  detailRowValue: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  detailRowIndicator: {
    marginLeft: 4,
  },
  detailRowSubtitle: {
    color: UI_COLORS.mutedStrong,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    paddingRight: 18,
  },
  footer: {
    position: 'absolute',
    left: UI_LAYOUT.footerSide,
    right: UI_LAYOUT.footerSide,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 10,
    ...UI_SHADOWS.floating,
  },
  footerSummary: {
    paddingHorizontal: 12,
    paddingRight: 8,
  },
  footerSummaryLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 4,
  },
  footerSummaryValue: {
    color: UI_COLORS.textStrong,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  addToCartButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: 18,
    backgroundColor: UI_COLORS.accentGreen,
    borderWidth: 1,
    borderColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  addToCartButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  addToCartButtonDisabled: {
    backgroundColor: UI_COLORS.surfaceTint,
    borderColor: UI_COLORS.surfaceTint,
  },
  addToCartTitle: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.buttonLarge,
    textAlign: 'center',
  },
  addToCartTitleDisabled: {
    color: UI_COLORS.textStrong,
  },
  addToCartSubtitle: {
    color: 'rgba(255, 255, 255, 0.84)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  addToCartSubtitleDisabled: {
    color: UI_COLORS.mutedStrong,
  },
});

export default ProductDetailScreen;
