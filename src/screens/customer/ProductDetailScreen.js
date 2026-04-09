import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
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
import { useFavourite } from '../../context/FavouriteContext';
import { getProductDetailById } from '../../services/productService';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductSubtitle } from '../../utils/productPresentation';

const MIN_QUANTITY = 1;

const DETAIL_COLORS = Object.freeze({
  screen: '#FCF8F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F1EA',
  border: '#EFE7DE',
  text: '#181725',
  mutedText: '#7C7C7C',
  hero: '#F3F6E9',
  accent: '#E53935',
  accentPressed: '#CF2E2A',
  successSoft: '#EFF8F0',
  successText: '#4B7A2A',
  errorSoft: '#FFF2F2',
  shadow: '#1C130B',
  minus: '#B7B7B7',
});

function normalizeRouteProductId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function HeaderButton({ children, onPress, accessibilityLabel, style }) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      android_ripple={{ color: '#F1EBE3' }}
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
  onPress,
  subtitle,
  title,
  value,
}) {
  return (
    <Pressable
      android_ripple={{ color: '#F2ECE3' }}
      onPress={onPress}
      style={({ pressed }) => [styles.detailRow, pressed && styles.detailRowPressed]}
    >
      <View style={styles.detailRowHeader}>
        <Text style={styles.detailRowTitle}>{title}</Text>
        <View style={styles.detailRowRight}>
          {value ? <Text style={styles.detailRowValue}>{value}</Text> : null}
          <Text style={styles.detailRowArrow}>{expanded ? 'v' : '>'}</Text>
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
  const { addToCart } = useCart();
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
          <ActivityIndicator color={DETAIL_COLORS.accent} size="large" />
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
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
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
  const productSubtitle = getProductSubtitle(product);
  const totalPriceLabel = formatCurrency(product.price * quantity);
  const favouriteActive = isFavourite(product.id);
  const nutritionValue =
    product.category?.toLowerCase() === 'beverages' ? '100ml' : '100gr';
  const nutritionDescription =
    product.category?.toLowerCase() === 'beverages'
      ? 'Nutrition info is not provided by the backend yet. Using the beverage serving label from the design layout.'
      : 'Nutrition info is not provided by the backend yet. This row keeps the Figma structure visible for demo.';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar
        backgroundColor={DETAIL_COLORS.screen}
        barStyle="dark-content"
      />
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <HeaderButton accessibilityLabel="Go back" onPress={handleBack}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </HeaderButton>

          <View style={styles.headerSpacer} />

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.infoBanner}>
              <ActivityIndicator color={DETAIL_COLORS.successText} size="small" />
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
            <ProductImage
              name={product.name}
              resizeMode="contain"
              source={imageSource}
              style={styles.productImage}
            />
          </View>

          <View style={styles.detailContent}>
            <View style={styles.titleRow}>
              <View style={styles.titleCopy}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSubtitle}>{productSubtitle}</Text>
              </View>

              <Pressable
                android_ripple={{ color: '#F4EEE7' }}
                onPress={() => toggleFavourite(product)}
                style={[
                  styles.favouriteButton,
                  favouriteActive && styles.favouriteButtonActive,
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

            <View style={styles.quantityPriceRow}>
              <View style={styles.quantityBlock}>
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
                <Text style={styles.quantityHelper}>
                  {isOutOfStock ? 'Out of stock' : `${product.stock} available`}
                </Text>
              </View>

              <View style={styles.priceBlock}>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.priceValue}>{formatCurrency(product.price)}</Text>
              </View>
            </View>

            <View style={styles.detailList}>
              <DetailRow
                expanded={expandedSection === 'details'}
                onPress={() => handleToggleSection('details')}
                subtitle={product.description}
                title="Product Details"
              />
              <DetailRow
                expanded={expandedSection === 'nutrition'}
                onPress={() => handleToggleSection('nutrition')}
                subtitle={nutritionDescription}
                title="Nutritions"
                value={nutritionValue}
              />
              <DetailRow
                expanded={expandedSection === 'reviews'}
                onPress={() => handleToggleSection('reviews')}
                subtitle="Reviews are not connected from the backend yet. Keep this row for the Figma-aligned layout."
                title="Reviews"
                value="(0)"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            android_ripple={{ color: '#D1383D' }}
            disabled={isOutOfStock}
            onPress={handleAddToCart}
            style={({ pressed }) => [
              styles.addToCartButton,
              isOutOfStock && styles.addToCartButtonDisabled,
              pressed && !isOutOfStock && styles.addToCartButtonPressed,
            ]}
          >
            <Text style={styles.addToCartTitle}>
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Text>
            <Text style={styles.addToCartTotal}>{totalPriceLabel}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DETAIL_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: DETAIL_COLORS.screen,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: DETAIL_COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  stateDescription: {
    color: DETAIL_COLORS.mutedText,
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 18,
  },
  headerSpacer: {
    flex: 1,
  },
  headerPlaceholder: {
    width: 44,
    height: 44,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DETAIL_COLORS.surface,
    borderWidth: 1,
    borderColor: DETAIL_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DETAIL_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  headerButtonPressed: {
    opacity: 0.92,
  },
  backIcon: {
    color: DETAIL_COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: DETAIL_COLORS.successSoft,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  infoBannerText: {
    color: DETAIL_COLORS.successText,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  errorBanner: {
    backgroundColor: DETAIL_COLORS.errorSoft,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  errorBannerText: {
    color: DETAIL_COLORS.accent,
    fontSize: 13,
    lineHeight: 20,
  },
  heroCard: {
    backgroundColor: DETAIL_COLORS.hero,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 26,
    marginBottom: 28,
  },
  productImage: {
    width: '100%',
    height: 230,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  detailContent: {
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  titleCopy: {
    flex: 1,
    paddingRight: 16,
  },
  favouriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: DETAIL_COLORS.border,
    backgroundColor: DETAIL_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favouriteButtonActive: {
    backgroundColor: '#FFE7E6',
    borderColor: '#F5C8C6',
  },
  favouriteIcon: {
    color: DETAIL_COLORS.mutedText,
    fontSize: 18,
    lineHeight: 20,
  },
  favouriteIconActive: {
    color: DETAIL_COLORS.accent,
  },
  productName: {
    color: DETAIL_COLORS.text,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 37,
    marginBottom: 8,
  },
  productSubtitle: {
    color: DETAIL_COLORS.mutedText,
    fontSize: 16,
    lineHeight: 22,
  },
  quantityPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  quantityBlock: {
    flex: 1,
    marginRight: 16,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  quantityHelper: {
    color: DETAIL_COLORS.mutedText,
    fontSize: 13,
    marginTop: 10,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: DETAIL_COLORS.surfaceMuted,
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  quantityButton: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: DETAIL_COLORS.surface,
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
    color: DETAIL_COLORS.minus,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
  quantityButtonLabelAccent: {
    color: DETAIL_COLORS.accent,
  },
  quantityValue: {
    color: DETAIL_COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginHorizontal: 18,
    minWidth: 22,
    textAlign: 'center',
  },
  priceLabel: {
    color: DETAIL_COLORS.mutedText,
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 6,
  },
  priceValue: {
    color: DETAIL_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  detailList: {
    backgroundColor: DETAIL_COLORS.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: DETAIL_COLORS.border,
  },
  detailRow: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: DETAIL_COLORS.border,
  },
  detailRowPressed: {
    opacity: 0.92,
  },
  detailRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailRowTitle: {
    color: DETAIL_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  detailRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailRowValue: {
    color: DETAIL_COLORS.mutedText,
    fontSize: 15,
    marginRight: 10,
  },
  detailRowArrow: {
    color: DETAIL_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  detailRowSubtitle: {
    color: DETAIL_COLORS.mutedText,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    paddingRight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: DETAIL_COLORS.screen,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DETAIL_COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: DETAIL_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  addToCartButtonPressed: {
    backgroundColor: DETAIL_COLORS.accentPressed,
  },
  addToCartButtonDisabled: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0,
  },
  addToCartTitle: {
    color: DETAIL_COLORS.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  addToCartTotal: {
    color: DETAIL_COLORS.surface,
    fontSize: 18,
    fontWeight: '800',
  },
});

export default ProductDetailScreen;
