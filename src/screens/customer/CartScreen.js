import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';

function CartScreen({ navigation }) {
  const { items, subtotal, totalItems, removeFromCart, updateQuantity } =
    useCart();

  const content = items.length === 0 ? (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Your cart is empty.</Text>
      <Text style={styles.emptySubtitle}>
        Add a few products from the home screen to continue the MVP flow.
      </Text>
      <PrimaryButton
        title="Browse Products"
        onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
      />
    </View>
  ) : (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.summaryText}>{totalItems} item(s) in your cart</Text>

      {items.map(item => (
        <View key={item.product.id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.productInfo}>
              <Text style={styles.name}>{item.product.name}</Text>
              <Text style={styles.meta}>
                {formatCurrency(item.product.price)} each
              </Text>
            </View>
            <Text style={styles.lineTotal}>
              {formatCurrency(item.product.price * item.quantity)}
            </Text>
          </View>

          <View style={styles.controls}>
            <View style={styles.quantityGroup}>
              <Pressable
                onPress={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </Pressable>

              <Text style={styles.quantityValue}>{item.quantity}</Text>

              <Pressable
                onPress={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => removeFromCart(item.product.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
      </View>

      <PrimaryButton
        title="Proceed to Checkout"
        onPress={() => navigation.navigate(CUSTOMER_ROUTES.CHECKOUT)}
      />
    </ScrollView>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        {content}

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
    backgroundColor: '#FBF7F2',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FBF7F2',
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  summaryText: {
    color: COLORS.muted,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  meta: {
    color: COLORS.muted,
  },
  lineTotal: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  quantityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  quantityValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  removeText: {
    color: COLORS.danger,
    fontWeight: '600',
  },
  totalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: COLORS.muted,
    fontSize: 16,
  },
  totalValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 120,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.muted,
    lineHeight: 22,
    marginBottom: 20,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
  },
});

export default CartScreen;
