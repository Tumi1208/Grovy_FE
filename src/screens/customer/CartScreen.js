import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  defaultProductImage,
  getProductImageSource,
} from '../../assets/productImages';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import ProductImage from '../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductSubtitle } from '../../utils/productPresentation';

function QuantityButton({ disabled = false, label, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#EEE6DC' }}
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
          styles.quantityButtonText,
          label === '+' ? styles.quantityButtonTextAccent : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CartItemRow({ item, onDecrease, onIncrease, onRemove }) {
  const subtitle = getProductSubtitle(item.product);
  const imageSource = getProductImageSource(item.product);
  const isIncreaseDisabled =
    item.product.stock > 0 && item.quantity >= item.product.stock;

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemMain}>
        <View style={styles.imageWrap}>
          <ProductImage
            name={item.product.name}
            resizeMode="contain"
            source={imageSource}
            style={styles.itemImage}
          />
        </View>

        <View style={styles.itemCopy}>
          <Text numberOfLines={2} style={styles.itemName}>
            {item.product.name}
          </Text>
          <Text numberOfLines={1} style={styles.itemSubtitle}>
            {subtitle}
          </Text>
          <Text style={styles.itemStock}>
            {item.product.stock > 0
              ? `${item.product.stock} available`
              : 'Unavailable'}
          </Text>
        </View>

        <Pressable
          accessibilityLabel={`Remove ${item.product.name}`}
          android_ripple={{ color: '#EEE6DC' }}
          onPress={() => onRemove(item.product.id)}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.removeButtonPressed,
          ]}
        >
          <Text style={styles.removeButtonLabel}>×</Text>
        </Pressable>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.quantityGroup}>
          <QuantityButton
            label="-"
            onPress={() => onDecrease(item.product.id)}
          />
          <Text style={styles.quantityValue}>{item.quantity}</Text>
          <QuantityButton
            disabled={isIncreaseDisabled}
            label="+"
            onPress={() => onIncrease(item.product.id)}
          />
        </View>

        <Text style={styles.itemPrice}>
          {formatCurrency(item.product.price * item.quantity)}
        </Text>
      </View>
    </View>
  );
}

function CartScreen({ navigation }) {
  const {
    decreaseQuantity,
    increaseQuantity,
    items,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();

  const hasItems = items.length > 0;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My cart</Text>
            <Text style={styles.headerSubtitle}>
              Review your basket before checkout.
            </Text>
          </View>

          <View style={styles.headerPill}>
            <Text style={styles.headerPillLabel}>
              {totalItems} item{totalItems === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {hasItems ? (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {items.map(item => (
                <CartItemRow
                  item={item}
                  key={item.product.id}
                  onDecrease={decreaseQuantity}
                  onIncrease={increaseQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.footerSummary}>
                <Text style={styles.footerSummaryLabel}>Subtotal</Text>
                <Text style={styles.footerSummaryValue}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>

              <Pressable
                android_ripple={{ color: '#3D5F39' }}
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.CHECKOUT)}
                style={({ pressed }) => [
                  styles.checkoutButton,
                  pressed && styles.checkoutButtonPressed,
                ]}
              >
                <Text style={styles.checkoutButtonLabel}>Checkout</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCard}>
              <View style={styles.emptyImageWrap}>
                <ProductImage
                  name="Empty cart"
                  resizeMode="contain"
                  source={defaultProductImage}
                  style={styles.emptyImage}
                />
              </View>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add a few groceries to start building your order.
              </Text>
              <Pressable
                android_ripple={{ color: '#3D5F39' }}
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
                style={({ pressed }) => [
                  styles.emptyStateButton,
                  pressed && styles.emptyStateButtonPressed,
                ]}
              >
                <Text style={styles.emptyStateButtonLabel}>
                  Continue shopping
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.bottomNavWrap}>
          <CustomerBottomNav
            activeRoute={CUSTOMER_ROUTES.CART}
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
    backgroundColor: UI_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: UI_COLORS.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.screenTitle,
  },
  headerSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  headerPill: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 8,
  },
  headerPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingBottom: 214,
  },
  itemRow: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 16,
    marginBottom: 14,
    ...UI_SHADOWS.card,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageWrap: {
    width: 86,
    height: 86,
    borderRadius: 22,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemImage: {
    width: 64,
    height: 64,
  },
  itemCopy: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    color: UI_COLORS.textStrong,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  itemSubtitle: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  itemStock: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonPressed: {
    opacity: 0.8,
  },
  removeButtonLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 20,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  quantityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xl,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  quantityButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: UI_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPressed: {
    opacity: 0.9,
  },
  quantityButtonDisabled: {
    opacity: 0.45,
  },
  quantityButtonText: {
    color: UI_COLORS.mutedStrong,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 22,
  },
  quantityButtonTextAccent: {
    color: UI_COLORS.accentGreen,
  },
  quantityValue: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  itemPrice: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  footer: {
    position: 'absolute',
    left: UI_LAYOUT.footerSide,
    right: UI_LAYOUT.footerSide,
    bottom: 92,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...UI_SHADOWS.floating,
  },
  footerSummary: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  checkoutButton: {
    minHeight: UI_LAYOUT.ctaHeight,
    minWidth: 148,
    backgroundColor: UI_COLORS.accentGreen,
    borderRadius: UI_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  checkoutButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  checkoutButtonLabel: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.buttonLarge,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingBottom: 132,
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
  emptyImageWrap: {
    width: 116,
    height: 116,
    borderRadius: 32,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyImage: {
    width: 84,
    height: 84,
  },
  emptyTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginBottom: 22,
    textAlign: 'center',
  },
  emptyStateButton: {
    minWidth: 220,
    minHeight: UI_LAYOUT.ctaHeight,
    backgroundColor: UI_COLORS.accentGreen,
    borderRadius: UI_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  emptyStateButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  emptyStateButtonLabel: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.buttonLarge,
    textAlign: 'center',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: UI_LAYOUT.bottomNavSide,
    right: UI_LAYOUT.bottomNavSide,
    bottom: UI_LAYOUT.bottomNavBottom,
  },
});

export default CartScreen;
