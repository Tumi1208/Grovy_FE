import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';

function CheckoutScreen({ navigation }) {
  const { items, subtotal, clearCart } = useCart();
  const { currentUser } = useApp();
  const [customerName, setCustomerName] = useState('Tom Nguyen');
  const [phone, setPhone] = useState('0123456789');
  const [address, setAddress] = useState('123 Sample Street');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePlaceOrder() {
    if (isSubmitting) {
      return;
    }

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('Please enter customer name, phone, and address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const order = await createOrder({
        customerId: currentUser?.id || null,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: Number(subtotal.toFixed(2)),
      });

      clearCart();
      navigation.reset({
        index: 0,
        routes: [
          {
            name: CUSTOMER_ROUTES.ORDER_SUCCESS,
            params: { orderId: order.id },
          },
        ],
      });
    } catch (error) {
      setErrorMessage(error.message || 'Could not place your order.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nothing to check out yet.</Text>
        <Text style={styles.emptySubtitle}>
          Return to the cart after adding products.
        </Text>
        <PrimaryButton
          title="Back to Cart"
          onPress={() => navigation.navigate(CUSTOMER_ROUTES.CART)}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Review your order</Text>
      <Text style={styles.subtitle}>
        This MVP checkout sends the cart to the Grovy backend. Payments are
        still out of scope for this step.
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Delivery details</Text>
        <TextInput
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Customer name"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="Phone number"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Delivery address"
          placeholderTextColor={COLORS.muted}
          style={[styles.input, styles.multilineInput]}
          multiline
        />
      </View>

      <View style={styles.card}>
        {items.map(item => (
          <View key={item.product.id} style={styles.row}>
            <Text style={styles.itemText}>
              {item.quantity} x {item.product.name}
            </Text>
            <Text style={styles.itemText}>
              {formatCurrency(item.product.price * item.quantity)}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Orders are sent to the backend API, while the cart itself remains
          local UI state until a later persistence step.
        </Text>
      </View>

      <PrimaryButton
        title={isSubmitting ? 'Placing Order...' : 'Place Order'}
        onPress={handlePlaceOrder}
        disabled={isSubmitting}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    lineHeight: 22,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemText: {
    color: COLORS.text,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalLabel: {
    color: COLORS.muted,
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  noteBox: {
    backgroundColor: '#EDFDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  noteText: {
    color: COLORS.primaryDark,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
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
});

export default CheckoutScreen;
