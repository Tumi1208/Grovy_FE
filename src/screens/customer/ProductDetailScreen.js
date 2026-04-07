import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductImageSource } from '../../assets/productImages';
import PrimaryButton from '../../components/PrimaryButton';
import ProductImage from '../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import { getProductDetailById } from '../../services/productService';
import { formatCurrency } from '../../utils/formatCurrency';

const MIN_QUANTITY = 1;

const UI_COLORS = Object.freeze({
  screen: '#F7F3EC',
  surface: '#FFFFFF',
  surfaceMuted: '#FAF7F2',
  border: '#E9E1D7',
  text: '#201A17',
  mutedText: '#7B736A',
  hero: '#DCC6EC',
  heroGlowPrimary: '#E8D8F3',
  heroGlowSecondary: '#F4E8FB',
  accent: '#D71920',
  accentPressed: '#B9151C',
  accentSoft: '#FFE9EA',
  successSoft: '#EBF7EE',
  successText: '#2B7A4B',
  errorSoft: '#FFF1F1',
  shadow: '#2C160B',
  buttonShadow: '#801A1E',
  minus: '#B7AEB8',
});

const UI_SPACING = Object.freeze({
  screen: 20,
  section: 18,
  card: 24,
});

const UI_RADIUS = Object.freeze({
  circle: 28,
  pill: 999,
  panel: 34,
  card: 30,
  button: 22,
  stepper: 24,
});

function normalizeRouteProductId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function TopActionButton({ children, onPress, accessibilityLabel, style }) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      android_ripple={{ color: '#EEE8E0' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.topActionButton,
        style,
        pressed && styles.topActionButtonPressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

function QuantityButton({
  accent = false,
  disabled = false,
  label,
  onPress,
}) {
  return (
    <Pressable
      android_ripple={{ color: '#F3EEE8' }}
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
          accent ? styles.quantityButtonLabelAccent : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function AddToCartButton({
  disabled = false,
  onPress,
  quantity,
  totalPriceLabel,
}) {
  return (
    <Pressable
      android_ripple={{ color: '#D1383D' }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.addToCartButton,
        disabled && styles.addToCartButtonDisabled,
        pressed && !disabled && styles.addToCartButtonPressed,
      ]}
    >
      <View style={styles.addToCartCopy}>
        <Text style={styles.addToCartTitle}>
          {disabled ? 'Out of Stock' : 'Add to Cart'}
        </Text>
        <Text style={styles.addToCartSubtitle}>
          {disabled ? 'This item is currently unavailable.' : `${quantity} item(s) selected`}
        </Text>
      </View>

      {!disabled ? (
        <View style={styles.addToCartTotalBadge}>
          <Text style={styles.addToCartTotalValue}>{totalPriceLabel}</Text>
        </View>
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
  const { addToCart, totalItems } = useCart();

  useEffect(() => {
    setQuantity(MIN_QUANTITY);
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

  function handleOpenCart() {
    navigation.navigate(CUSTOMER_ROUTES.CART);
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
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.centeredState}>
          <ActivityIndicator color={UI_COLORS.accent} size="large" />
          <Text style={styles.stateTitle}>Loading product detail...</Text>
          <Text style={styles.stateDescription}>
            Fetching the latest product data from the Grovy backend.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.centeredState}>
          <Text style={styles.stateTitle}>Could not load product detail.</Text>
          <Text style={styles.stateDescription}>
            {error || 'The selected product could not be resolved.'}
          </Text>
          <View style={styles.stateSpacer} />
          <PrimaryButton title="Retry" onPress={handleRetry} />
          <View style={styles.buttonSpacer} />
          <PrimaryButton
            title="Back to Home"
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
  const totalPriceLabel = formatCurrency(product.price * quantity);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TopActionButton accessibilityLabel="Go back" onPress={handleBack}>
            <Text style={styles.backIcon}>‹</Text>
          </TopActionButton>

          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>Grovy</Text>
            <Text style={styles.headerTitle}>Product Detail</Text>
          </View>

          <TopActionButton
            accessibilityLabel="Open cart"
            onPress={handleOpenCart}
            style={styles.cartActionButton}
          >
            <Text style={styles.cartCount}>{totalItems}</Text>
            <Text style={styles.cartLabel}>Cart</Text>
          </TopActionButton>
        </View>

        {loading ? (
          <View style={styles.infoBanner}>
            <ActivityIndicator color={UI_COLORS.successText} size="small" />
            <Text style={styles.infoBannerText}>
              Refreshing product detail from the API.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              {error} Showing the product data passed from Home.
            </Text>
          </View>
        ) : null}

        <View style={styles.heroCard}>
          <View style={styles.heroGlowPrimary} />
          <View style={styles.heroGlowSecondary} />

          <View style={styles.heroMetaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeLabel}>{product.category}</Text>
            </View>

            <View
              style={[
                styles.stockBadge,
                isOutOfStock && styles.stockBadgeMuted,
              ]}
            >
              <Text
                style={[
                  styles.stockBadgeLabel,
                  isOutOfStock && styles.stockBadgeLabelMuted,
                ]}
              >
                {isOutOfStock ? 'Unavailable' : `${product.stock} left`}
              </Text>
            </View>
          </View>

          <ProductImage
            name={product.name}
            resizeMode="contain"
            source={imageSource}
            style={styles.productImage}
          />
        </View>

        <View style={styles.detailSheet}>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>{formatCurrency(product.price)}</Text>
            </View>

            <View style={styles.priceHintPill}>
              <Text style={styles.priceHintText}>Fresh pick</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          <View style={styles.purchaseCard}>
            <View style={styles.purchaseHeader}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <Text style={styles.quantityHelper}>
                {isOutOfStock ? 'Out of stock' : `Max ${product.stock}`}
              </Text>
            </View>

            <View style={styles.quantityStepper}>
              <QuantityButton
                disabled={isOutOfStock || quantity <= MIN_QUANTITY}
                label="−"
                onPress={handleDecreaseQuantity}
              />
              <Text style={styles.quantityValue}>{quantity}</Text>
              <QuantityButton
                accent
                disabled={isIncreaseDisabled}
                label="+"
                onPress={handleIncreaseQuantity}
              />
            </View>
          </View>

          <AddToCartButton
            disabled={isOutOfStock}
            onPress={handleAddToCart}
            quantity={quantity}
            totalPriceLabel={totalPriceLabel}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.screen,
  },
  content: {
    paddingHorizontal: UI_SPACING.screen,
    paddingTop: 8,
    paddingBottom: 36,
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: UI_COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  stateDescription: {
    color: UI_COLORS.mutedText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  stateSpacer: {
    height: 24,
  },
  buttonSpacer: {
    height: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerEyebrow: {
    color: UI_COLORS.mutedText,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  headerTitle: {
    color: UI_COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  topActionButton: {
    width: 56,
    height: 56,
    borderRadius: UI_RADIUS.circle,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  cartActionButton: {
    width: 72,
    borderRadius: 22,
  },
  topActionButtonPressed: {
    opacity: 0.92,
  },
  backIcon: {
    color: UI_COLORS.text,
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 30,
    marginLeft: -2,
  },
  cartCount: {
    color: UI_COLORS.accent,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  cartLabel: {
    color: UI_COLORS.mutedText,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: UI_COLORS.successSoft,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  infoBannerText: {
    color: UI_COLORS.successText,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  errorBanner: {
    backgroundColor: UI_COLORS.errorSoft,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  errorBannerText: {
    color: UI_COLORS.accent,
    fontSize: 14,
    lineHeight: 21,
  },
  heroCard: {
    backgroundColor: UI_COLORS.hero,
    borderRadius: UI_RADIUS.panel,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 26,
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: UI_COLORS.heroGlowPrimary,
  },
  heroGlowSecondary: {
    position: 'absolute',
    left: -28,
    bottom: -36,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: UI_COLORS.heroGlowSecondary,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: UI_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  categoryBadgeLabel: {
    color: UI_COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stockBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: UI_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stockBadgeMuted: {
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
  },
  stockBadgeLabel: {
    color: UI_COLORS.successText,
    fontSize: 12,
    fontWeight: '700',
  },
  stockBadgeLabelMuted: {
    color: UI_COLORS.mutedText,
  },
  productImage: {
    width: '100%',
    height: 255,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  detailSheet: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.panel,
    marginTop: -24,
    padding: UI_SPACING.card,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 3,
  },
  productName: {
    color: UI_COLORS.text,
    fontSize: 33,
    fontWeight: '800',
    lineHeight: 39,
    marginBottom: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  priceLabel: {
    color: UI_COLORS.mutedText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  priceValue: {
    color: UI_COLORS.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
  },
  priceHintPill: {
    backgroundColor: UI_COLORS.surfaceMuted,
    borderRadius: UI_RADIUS.pill,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  priceHintText: {
    color: UI_COLORS.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionSection: {
    borderTopWidth: 1,
    borderTopColor: UI_COLORS.border,
    paddingTop: 18,
    marginBottom: 22,
  },
  sectionTitle: {
    color: UI_COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  descriptionText: {
    color: UI_COLORS.mutedText,
    fontSize: 16,
    lineHeight: 25,
  },
  purchaseCard: {
    backgroundColor: UI_COLORS.surfaceMuted,
    borderRadius: UI_RADIUS.card,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    marginBottom: 18,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  quantityHelper: {
    color: UI_COLORS.mutedText,
    fontSize: 13,
    fontWeight: '600',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.stepper,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quantityButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: UI_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  quantityButtonPressed: {
    opacity: 0.88,
  },
  quantityButtonDisabled: {
    opacity: 0.42,
  },
  quantityButtonLabel: {
    color: UI_COLORS.minus,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },
  quantityButtonLabelAccent: {
    color: UI_COLORS.accent,
  },
  quantityValue: {
    color: UI_COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UI_COLORS.accent,
    borderRadius: UI_RADIUS.button,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: UI_COLORS.buttonShadow,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 5,
  },
  addToCartButtonPressed: {
    backgroundColor: UI_COLORS.accentPressed,
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  addToCartCopy: {
    flex: 1,
    paddingRight: 12,
  },
  addToCartTitle: {
    color: UI_COLORS.surface,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  addToCartSubtitle: {
    color: 'rgba(255, 255, 255, 0.84)',
    fontSize: 13,
    fontWeight: '600',
  },
  addToCartTotalBadge: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  addToCartTotalValue: {
    color: UI_COLORS.accent,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default ProductDetailScreen;
