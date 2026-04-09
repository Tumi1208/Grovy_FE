import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductImageSource } from '../../assets/productImages';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import ProductImage from '../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductSubtitle } from '../../utils/productPresentation';

const CART_COLORS = Object.freeze({
  screen: '#FCF8F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F2EB',
  border: '#EFE7DE',
  text: '#181725',
  muted: '#7C7C7C',
  accent: '#E53935',
  accentPressed: '#CF2E2A',
  shadow: '#1C130B',
});

function QuantityButton({ disabled = false, label, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#F1EBE3' }}
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

function CartItemRow({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}) {
  const subtitle = getProductSubtitle(item.product);
  const imageSource = getProductImageSource(item.product);

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
        </View>

        <Pressable
          accessibilityLabel={`Remove ${item.product.name}`}
          android_ripple={{ color: '#F3ECE3' }}
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
          <Text style={styles.headerTitle}>My Cart</Text>
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

            <View style={styles.summaryPanel}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>{totalItems}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>

              <Pressable
                android_ripple={{ color: '#D1383D' }}
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.CHECKOUT)}
                style={({ pressed }) => [
                  styles.checkoutButton,
                  pressed && styles.checkoutButtonPressed,
                ]}
              >
                <Text style={styles.checkoutButtonLabel}>Go to checkout</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add a few items from the shop to see them listed here.
            </Text>
            <Pressable
              android_ripple={{ color: '#D1383D' }}
              onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
              style={({ pressed }) => [
                styles.checkoutButton,
                pressed && styles.checkoutButtonPressed,
              ]}
            >
              <Text style={styles.checkoutButtonLabel}>Continue Shopping</Text>
            </Pressable>
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
    backgroundColor: CART_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: CART_COLORS.screen,
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    color: CART_COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 232,
  },
  itemRow: {
    backgroundColor: CART_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CART_COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: CART_COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemImage: {
    width: 54,
    height: 54,
    backgroundColor: 'transparent',
  },
  itemCopy: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    color: CART_COLORS.text,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 4,
  },
  itemSubtitle: {
    color: CART_COLORS.muted,
    fontSize: 14,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonPressed: {
    opacity: 0.7,
  },
  removeButtonLabel: {
    color: CART_COLORS.muted,
    fontSize: 24,
    lineHeight: 24,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  quantityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CART_COLORS.surfaceMuted,
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  quantityButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: CART_COLORS.surface,
    borderWidth: 1,
    borderColor: CART_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPressed: {
    opacity: 0.9,
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityButtonText: {
    color: CART_COLORS.muted,
    fontSize: 24,
    fontWeight: '600',
  },
  quantityButtonTextAccent: {
    color: CART_COLORS.accent,
  },
  quantityValue: {
    color: CART_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 26,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  itemPrice: {
    color: CART_COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  summaryPanel: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 102,
    backgroundColor: CART_COLORS.screen,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: CART_COLORS.muted,
    fontSize: 16,
  },
  summaryValue: {
    color: CART_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 132,
  },
  emptyTitle: {
    color: CART_COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: CART_COLORS.muted,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: CART_COLORS.accent,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginTop: 8,
    shadowColor: CART_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  checkoutButtonPressed: {
    backgroundColor: CART_COLORS.accentPressed,
  },
  checkoutButtonLabel: {
    color: CART_COLORS.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
  },
});

export default CartScreen;
