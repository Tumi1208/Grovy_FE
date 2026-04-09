import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import {
  buildCreateOrderPayload,
  submitOrder,
} from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';

const CHECKOUT_COLORS = Object.freeze({
  screen: '#FCF8F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F2EB',
  border: '#EFE7DE',
  text: '#181725',
  muted: '#7C7C7C',
  accent: '#E53935',
  accentPressed: '#CF2E2A',
  successSoft: '#EFF8F0',
  successText: '#4B7A2A',
  errorSoft: '#FFF2F2',
  shadow: '#1C130B',
});

const DELIVERY_FEE = 0;
const DISCOUNT_AMOUNT = 0;

function SummaryRow({ emphasized = false, label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text
        style={[
          styles.summaryLabel,
          emphasized && styles.summaryLabelEmphasized,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          emphasized && styles.summaryValueEmphasized,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function CheckoutOptionRow({ title, value }) {
  return (
    <View style={styles.optionRow}>
      <Text style={styles.optionTitle}>{title}</Text>
      <View style={styles.optionValueWrap}>
        <Text numberOfLines={1} style={styles.optionValue}>
          {value}
        </Text>
        <Text style={styles.optionArrow}>{'>'}</Text>
      </View>
    </View>
  );
}

function CheckoutScreen({ navigation }) {
  const { items, subtotal, clearCart } = useCart();
  const { currentUser } = useApp();
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('199 Grovy Street, Fresh District');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalCost = useMemo(
    () => Math.max(0, subtotal + DELIVERY_FEE - DISCOUNT_AMOUNT),
    [subtotal],
  );

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
      const orderPayload = buildCreateOrderPayload({
        customerId: currentUser?.id || null,
        customerName,
        phone,
        address,
        cartItems: items,
        totalAmount: totalCost,
      });
      const result = await submitOrder(orderPayload);

      clearCart();
      navigation.reset({
        index: 0,
        routes: [
          {
            name: CUSTOMER_ROUTES.ORDER_SUCCESS,
            params: {
              order: result.order,
              submitMode: result.mode,
              fallbackReason: result.fallbackReason || '',
            },
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
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nothing to checkout yet</Text>
          <Text style={styles.emptySubtitle}>
            Return to your cart before placing an order.
          </Text>
          <Pressable
            android_ripple={{ color: '#D1383D' }}
            onPress={() => navigation.navigate(CUSTOMER_ROUTES.CART)}
            style={({ pressed }) => [
              styles.placeOrderButton,
              pressed && styles.placeOrderButtonPressed,
            ]}
          >
            <Text style={styles.placeOrderButtonLabel}>Back to Cart</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Checkout</Text>
          </View>

          <View style={styles.groupedCard}>
            <CheckoutOptionRow title="Delivery" value={address.trim()} />
            <View style={styles.divider} />
            <CheckoutOptionRow title="Payment" value="Cash on delivery" />
            <View style={styles.divider} />
            <CheckoutOptionRow title="Promo Code" value="Pick discount" />
            <View style={styles.divider} />
            <CheckoutOptionRow
              title="Total Cost"
              value={formatCurrency(totalCost)}
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Receiver Details</Text>
            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Customer name"
              placeholderTextColor={CHECKOUT_COLORS.muted}
              style={styles.input}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone number"
              placeholderTextColor={CHECKOUT_COLORS.muted}
              style={styles.input}
            />
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Delivery address"
              placeholderTextColor={CHECKOUT_COLORS.muted}
              style={[styles.input, styles.multilineInput]}
              multiline
            />
          </View>

          <View style={styles.summaryCard}>
            <SummaryRow
              label="Subtotal"
              value={formatCurrency(subtotal)}
            />
            <SummaryRow
              label="Delivery"
              value={DELIVERY_FEE > 0 ? formatCurrency(DELIVERY_FEE) : 'Free'}
            />
            <SummaryRow
              label="Promo"
              value={
                DISCOUNT_AMOUNT > 0 ? `-${formatCurrency(DISCOUNT_AMOUNT)}` : 'None'
              }
            />
            <View style={styles.divider} />
            <SummaryRow
              emphasized
              label="Total Cost"
              value={formatCurrency(totalCost)}
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            android_ripple={{ color: '#D1383D' }}
            disabled={isSubmitting}
            onPress={handlePlaceOrder}
            style={({ pressed }) => [
              styles.placeOrderButton,
              isSubmitting && styles.placeOrderButtonDisabled,
              pressed && !isSubmitting && styles.placeOrderButtonPressed,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={CHECKOUT_COLORS.surface} size="small" />
            ) : (
              <>
                <Text style={styles.placeOrderButtonLabel}>Place Order</Text>
                <Text style={styles.placeOrderButtonValue}>
                  {formatCurrency(totalCost)}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CHECKOUT_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: CHECKOUT_COLORS.screen,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 148,
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 18,
  },
  title: {
    color: CHECKOUT_COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  groupedCard: {
    backgroundColor: CHECKOUT_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CHECKOUT_COLORS.border,
    overflow: 'hidden',
    marginBottom: 18,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  optionTitle: {
    color: CHECKOUT_COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  optionValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: 16,
  },
  optionValue: {
    color: CHECKOUT_COLORS.muted,
    fontSize: 15,
    textAlign: 'right',
    maxWidth: '86%',
  },
  optionArrow: {
    color: CHECKOUT_COLORS.text,
    fontSize: 16,
    marginLeft: 10,
  },
  formCard: {
    backgroundColor: CHECKOUT_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CHECKOUT_COLORS.border,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    color: CHECKOUT_COLORS.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: CHECKOUT_COLORS.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CHECKOUT_COLORS.border,
    color: CHECKOUT_COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: CHECKOUT_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CHECKOUT_COLORS.border,
    padding: 18,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: CHECKOUT_COLORS.muted,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: CHECKOUT_COLORS.border,
    marginVertical: 14,
  },
  summaryLabelEmphasized: {
    color: CHECKOUT_COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  summaryValue: {
    color: CHECKOUT_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValueEmphasized: {
    fontSize: 22,
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: CHECKOUT_COLORS.errorSoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: CHECKOUT_COLORS.accent,
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: CHECKOUT_COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: CHECKOUT_COLORS.muted,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    backgroundColor: CHECKOUT_COLORS.screen,
  },
  placeOrderButton: {
    minHeight: 58,
    backgroundColor: CHECKOUT_COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: CHECKOUT_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  placeOrderButtonPressed: {
    backgroundColor: CHECKOUT_COLORS.accentPressed,
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  placeOrderButtonLabel: {
    color: CHECKOUT_COLORS.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  placeOrderButtonValue: {
    color: CHECKOUT_COLORS.surface,
    fontSize: 18,
    fontWeight: '800',
  },
});

export default CheckoutScreen;
