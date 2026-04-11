import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductImageSource } from '../../assets/productImages';
import PrimaryButton from '../../components/PrimaryButton';
import ProductImage from '../../components/ProductImage';
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

function normalizeRouteProductId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function HeaderButton({ children, onPress, style }) {
  return (
    <Pressable
      android_ripple={{ color: '#EDE5DB' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerButton,
        style,
        pressed && styles.headerButtonPressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

function QuantityButton({ disabled = false, label, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#EFE7DD' }}
      disabled={disabled}
      onPress={onPress}
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
    </Pressable>
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
    <Pressable
      android_ripple={{ color: '#EFE8DE' }}
      onPress={onPress}
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
          <Text
            style={[
              styles.detailRowArrow,
              expanded && styles.detailRowArrowExpanded,
            ]}
          >
            {'>'}
          </Text>
        </View>
      </View>

      {expanded && subtitle ? (
        <Text style={styles.detailRowSubtitle}>{subtitle}</Text>
      ) : null}
    </Pressable>
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

  const imageSource = getProductImageSource(product);
  const isOutOfStock = product.stock <= 0;
  const isIncreaseDisabled =
    isOutOfStock || (product.stock > 0 && quantity >= product.stock);
  const productSubtitle = getProductSubtitle(product);
  const totalPriceLabel = formatCurrency(product.price * quantity);
  const favouriteActive = isFavourite(product.id);
  const nutritionValue =
    product.category?.toLowerCase() === 'beverages' ? '100 ml' : '100 g';
  const nutritionDescription = 'Nutrition details will appear here when available.';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar
        backgroundColor={UI_COLORS.screenLight}
        barStyle="dark-content"
      />
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <HeaderButton onPress={handleBack}>
            <Text style={styles.backIcon}>{'<'}</Text>
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
            <View style={styles.heroTopRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillLabel}>{product.category}</Text>
              </View>

              <Pressable
                android_ripple={{ color: '#EDE5DB' }}
                onPress={() => toggleFavourite(product)}
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
              </Pressable>
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
                  isOutOfStock ? styles.metaPillWarning : styles.metaPillSuccess,
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
              <Text style={styles.summaryMetaText}>{productSubtitle}</Text>
            </View>

            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>

            <View style={styles.priceRow}>
              <View>
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

          <Pressable
            android_ripple={{ color: '#3B5B37' }}
            disabled={isOutOfStock}
            onPress={handleAddToCart}
            style={({ pressed }) => [
              styles.addToCartButton,
              isOutOfStock && styles.addToCartButtonDisabled,
              pressed && !isOutOfStock && styles.addToCartButtonPressed,
            ]}
          >
            <Text style={styles.addToCartTitle}>
              {isOutOfStock ? 'Unavailable' : `Add ${quantity} to cart`}
            </Text>
          </Pressable>
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
    opacity: 0.9,
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
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryPill: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surface,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: UI_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favouriteButtonActive: {
    backgroundColor: UI_COLORS.accentRedSoft,
  },
  favouriteButtonPressed: {
    opacity: 0.88,
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
  },
  summaryCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
    ...UI_TYPOGRAPHY.heroTitle,
    marginBottom: 10,
  },
  productDescription: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginBottom: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: UI_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPressed: {
    opacity: 0.88,
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
    marginHorizontal: 16,
    minWidth: 22,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
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
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: UI_COLORS.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailRowPressed: {
    opacity: 0.95,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  detailRowValue: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  detailRowArrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 16,
    fontWeight: '700',
  },
  detailRowArrowExpanded: {
    transform: [{ rotate: '90deg' }],
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
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 10,
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
    borderRadius: UI_RADIUS.xl,
    backgroundColor: UI_COLORS.accentGreen,
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
