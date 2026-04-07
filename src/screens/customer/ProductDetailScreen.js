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
import { COLORS } from '../../constants/colors';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import { getProductDetailById } from '../../services/productService';
import { formatCurrency } from '../../utils/formatCurrency';

const MIN_QUANTITY = 1;

function normalizeRouteProductId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function IconButton({ label, onPress, title }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      android_ripple={{ color: '#E7F0E6' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.pressedButton,
      ]}
    >
      <Text style={styles.iconButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function QuantityButton({ disabled = false, label, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#E7F0E6' }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quantityButton,
        disabled && styles.quantityButtonDisabled,
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      <Text style={styles.quantityButtonLabel}>{label}</Text>
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

    const maxQuantity = product?.stock > 0 ? product.stock : quantity + 1;

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
          <ActivityIndicator color={COLORS.primaryDark} size="large" />
          <Text style={styles.stateTitle}>Loading product detail...</Text>
          <Text style={styles.stateDescription}>
            Fetching the latest data from the Grovy backend.
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

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <IconButton label="<" onPress={handleBack} title="Go back" />

          <Pressable
            android_ripple={{ color: '#E7F0E6' }}
            onPress={handleOpenCart}
            style={({ pressed }) => [
              styles.cartBadge,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.cartBadgeValue}>{totalItems}</Text>
            <Text style={styles.cartBadgeLabel}>Cart</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.infoBanner}>
            <ActivityIndicator color={COLORS.primaryDark} size="small" />
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

        <View style={styles.imageCard}>
          <View style={styles.imageGlowLarge} />
          <View style={styles.imageGlowSmall} />
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillLabel}>{product.category}</Text>
          </View>
          <ProductImage
            name={product.name}
            resizeMode="contain"
            source={imageSource}
            style={styles.image}
          />
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Availability</Text>
            <Text style={styles.metaValue}>
              {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
            </Text>
          </View>

          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Quantity</Text>
            <View style={styles.stepper}>
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

        <PrimaryButton
          disabled={isOutOfStock}
          onPress={handleAddToCart}
          title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        />

        <Text style={styles.footerNote}>
          {isOutOfStock
            ? 'This item is unavailable right now, so the CTA is disabled.'
            : `${quantity} item(s) will be added, then the flow moves to Cart for demo.`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F1',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  stateDescription: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  stateSpacer: {
    height: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#DCE7D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonLabel: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: -1,
  },
  cartBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE7D9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 86,
  },
  cartBadgeValue: {
    color: COLORS.primaryDark,
    fontSize: 18,
    fontWeight: '800',
  },
  cartBadgeLabel: {
    color: '#65756A',
    fontSize: 12,
    fontWeight: '600',
  },
  pressedButton: {
    opacity: 0.9,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EDF7EE',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  infoBannerText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  errorBanner: {
    backgroundColor: '#FFF1F1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  errorBannerText: {
    color: COLORS.danger,
    fontSize: 14,
    lineHeight: 21,
  },
  imageCard: {
    backgroundColor: '#EAF4E4',
    borderRadius: 32,
    padding: 20,
    minHeight: 320,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 18,
  },
  imageGlowLarge: {
    position: 'absolute',
    top: -44,
    right: -24,
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: '#D9EBD2',
  },
  imageGlowSmall: {
    position: 'absolute',
    left: -20,
    bottom: -26,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#D4E7CF',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 18,
  },
  categoryPillLabel: {
    color: '#4B6350',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  image: {
    width: '100%',
    height: 230,
    backgroundColor: 'transparent',
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E0E8DA',
    padding: 20,
    marginBottom: 16,
  },
  name: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 10,
  },
  price: {
    color: '#D92C20',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 18,
  },
  sectionBlock: {
    borderTopWidth: 1,
    borderTopColor: '#EDF1EA',
    paddingTop: 16,
  },
  sectionLabel: {
    color: '#5F7064',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  description: {
    color: '#39453D',
    fontSize: 16,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  metaCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E8DA',
    padding: 18,
  },
  metaLabel: {
    color: '#6D7B71',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F5F8F3',
    borderWidth: 1,
    borderColor: '#DCE7D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.45,
  },
  quantityButtonLabel: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
  },
  quantityValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  footerNote: {
    color: '#6D7B71',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  buttonSpacer: {
    height: 12,
  },
});

export default ProductDetailScreen;
