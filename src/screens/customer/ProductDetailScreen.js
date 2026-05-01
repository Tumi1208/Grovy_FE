import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

function HeaderButton({ children, onPress, style }) {
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
    >
      {children}
    </ScalePressable>
  );
}

function QuantityButton({ disabled = false, label, onPress }) {
  return (
    <ScalePressable
      android_ripple={{ color: '#EFE7DD' }}
      disabled={disabled}
      onPress={onPress}
      pressScale={0.94}
      style={({ pressed }) => [
        styles.quantityButton,
        disabled && styles.quantityButtonDisabled,
        pressed && !disabled && styles.quantityButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.quantityButtonLabel,
          label === '+' ? styles.quantityButtonLabelAccent : null,
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

  useEffect(() => {
    setQuantity(MIN_QUANTITY);
    setExpandedSection('details');
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

  function handleBack() {
    if (navigation.canGoBack()) {
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
  const totalPriceLabel = formatCurrency(product.price * quantity);
  const favouriteActive = isFavourite(product.id);
  const nutritionValue =
    product.category?.toLowerCase() === 'beverages' ? '100 ml' : '100 g';
  const nutritionDescription =
    'Nutrition details will appear here when available.';
  const assistantSuggestion = getProductAssistantSuggestion(product);

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
          <HeaderButton onPress={handleBack}>
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
          contentContainerStyle={styles.content}
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

          <View style={styles.heroCard}>
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

            <ProductImage
              name={product.name}
              resizeMode="contain"
              source={imageSource}
              style={styles.productImage}
            />
          </View>

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
                  {isOutOfStock ? 'Out of stock' : `${product.stock} available`}
                </Text>
              </View>
              <Text style={styles.summaryMetaText}>
                {isOutOfStock
                  ? 'Unavailable today'
                  : `${product.stock} left today`}
              </Text>
            </View>

            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productSubtitle}>{productSubtitle}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>

            <View style={styles.priceRow}>
              <View style={styles.priceBlock}>
                <Text style={styles.priceCaption}>Price</Text>
                <Text style={styles.priceValue}>
                  {formatCurrency(product.price)}
                </Text>
              </View>

              <View style={styles.quantityBlock}>
                <Text style={styles.quantityCaption}>Quantity</Text>
                <View style={styles.quantityStepper}>
                  <QuantityButton
                    disabled={isOutOfStock || quantity <= MIN_QUANTITY}
                    label="-"
                    onPress={handleDecreaseQuantity}
                  />
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <QuantityButton
                    disabled={isIncreaseDisabled}
                    label="+"
                    onPress={handleIncreaseQuantity}
                  />
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
                <View>
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

              <Text style={styles.assistantCardAction}>
                {assistantSuggestion.ctaLabel}
              </Text>
            </ScalePressable>
          ) : null}

          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Product information</Text>

            <DetailRow
              expanded={expandedSection === 'details'}
              onPress={() => handleToggleSection('details')}
              subtitle={product.description}
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
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerSummary}>
            <Text style={styles.footerSummaryLabel}>Total</Text>
            <Text style={styles.footerSummaryValue}>{totalPriceLabel}</Text>
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
          >
            <Text style={styles.addToCartTitle}>
              {isOutOfStock ? 'Unavailable' : `Add ${quantity} to cart`}
            </Text>
          </ScalePressable>
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
    paddingBottom: 18,
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
    ...UI_SHADOWS.card,
  },
  heroToneLarge: {
    position: 'absolute',
    right: -28,
    bottom: -26,
    width: 182,
    height: 182,
    borderRadius: 91,
    backgroundColor: 'rgba(215, 155, 90, 0.12)',
  },
  heroToneSmall: {
    position: 'absolute',
    left: -20,
    top: 66,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(84, 122, 78, 0.1)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  productImage: {
    width: '100%',
    height: 248,
    zIndex: 1,
  },
  summaryCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 24,
    marginBottom: 14,
    ...UI_SHADOWS.card,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 12,
    flex: 1,
    textAlign: 'right',
  },
  productName: {
    color: UI_COLORS.textStrong,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 6,
  },
  productSubtitle: {
    color: UI_COLORS.mutedStrong,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  productDescription: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginBottom: 24,
  },
  assistantCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    marginBottom: 14,
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
  assistantCardAction: {
    color: UI_COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  quantityBlock: {
    alignItems: 'flex-end',
    minWidth: 150,
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
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  quantityButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPressed: {
    opacity: 0.95,
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
  quantityValue: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '800',
    marginHorizontal: 14,
    minWidth: 22,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    overflow: 'hidden',
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
    bottom: UI_LAYOUT.footerBottom,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 9,
    ...UI_SHADOWS.floating,
  },
  footerSummary: {
    paddingHorizontal: 12,
    paddingRight: 10,
  },
  footerSummaryLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 4,
  },
  footerSummaryValue: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  addToCartButton: {
    flex: 1,
    minHeight: UI_LAYOUT.ctaHeight,
    borderRadius: 16,
    backgroundColor: UI_COLORS.accentGreen,
    borderWidth: 1,
    borderColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  addToCartButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  addToCartButtonDisabled: {
    backgroundColor: UI_COLORS.surfaceTint,
  },
  addToCartTitle: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.buttonLarge,
  },
});

export default ProductDetailScreen;
