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
import { defaultProductImage } from '../../assets/productImages';
import ProductImage from '../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import {
  buildCreateOrderPayload,
  submitOrder,
} from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';

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

function HeaderButton({ children, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#EEE6DC' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerButton,
        pressed && styles.headerButtonPressed,
      ]}
    >
      {children}
    </Pressable>
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
      setErrorMessage('Please enter your name, phone number and address.');
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
          <View style={styles.emptyCard}>
            <View style={styles.emptyImageWrap}>
              <ProductImage
                name="Checkout"
                resizeMode="contain"
                source={defaultProductImage}
                style={styles.emptyImage}
              />
            </View>
            <Text style={styles.emptyTitle}>Nothing to check out yet</Text>
            <Text style={styles.emptySubtitle}>
              Return to your cart before placing an order.
            </Text>
            <Pressable
              android_ripple={{ color: '#3D5F39' }}
              onPress={() => navigation.navigate(CUSTOMER_ROUTES.CART)}
              style={({ pressed }) => [
                styles.placeOrderButton,
                pressed && styles.placeOrderButtonPressed,
              ]}
            >
              <Text style={styles.placeOrderButtonLabel}>Back to cart</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <HeaderButton onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </HeaderButton>

          <View style={styles.headerCopy}>
            <Text style={styles.title}>Checkout</Text>
            <Text style={styles.headerSubtitle}>
              Delivery details and order review
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Order summary</Text>

            <SummaryRow label="Items" value={`${items.length}`} />
            <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
            <SummaryRow
              label="Delivery"
              value={DELIVERY_FEE > 0 ? formatCurrency(DELIVERY_FEE) : 'Free'}
            />
            <SummaryRow
              label="Payment"
              value={DISCOUNT_AMOUNT > 0 ? 'Discount applied' : 'Cash'}
            />

            <View style={styles.summaryDivider} />

            <SummaryRow
              emphasized
              label="Total"
              value={formatCurrency(totalCost)}
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Receiver details</Text>

            <Text style={styles.inputLabel}>Full name</Text>
            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Customer name"
              placeholderTextColor={UI_COLORS.muted}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone number"
              placeholderTextColor={UI_COLORS.muted}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Delivery address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Delivery address"
              placeholderTextColor={UI_COLORS.muted}
              style={[styles.input, styles.multilineInput]}
              multiline
            />

            <View style={styles.paymentNote}>
              <Text style={styles.paymentNoteLabel}>Payment method</Text>
              <Text style={styles.paymentNoteValue}>Cash on delivery</Text>
            </View>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerTotalWrap}>
            <Text style={styles.footerTotalLabel}>Order total</Text>
            <Text style={styles.footerTotalValue}>
              {formatCurrency(totalCost)}
            </Text>
          </View>

          <Pressable
            android_ripple={{ color: '#3D5F39' }}
            disabled={isSubmitting}
            onPress={handlePlaceOrder}
            style={({ pressed }) => [
              styles.placeOrderButton,
              isSubmitting && styles.placeOrderButtonDisabled,
              pressed && !isSubmitting && styles.placeOrderButtonPressed,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={UI_COLORS.surface} size="small" />
            ) : (
              <Text style={styles.placeOrderButtonLabel}>Place order</Text>
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
    backgroundColor: UI_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: UI_COLORS.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerButton: {
    width: UI_LAYOUT.iconButton,
    height: UI_LAYOUT.iconButton,
    borderRadius: UI_RADIUS.lg,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerButtonPressed: {
    opacity: 0.88,
  },
  backIcon: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.sectionTitle,
  },
  headerSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingBottom: 152,
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
  cardTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 15,
    lineHeight: 20,
  },
  summaryLabelEmphasized: {
    color: UI_COLORS.textStrong,
    fontWeight: '700',
  },
  summaryValue: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  summaryValueEmphasized: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: UI_COLORS.border,
    marginVertical: 10,
  },
  formCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  inputLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 8,
  },
  input: {
    minHeight: UI_LAYOUT.searchHeight,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xl,
    color: UI_COLORS.textStrong,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    lineHeight: 20,
  },
  multilineInput: {
    minHeight: 108,
    textAlignVertical: 'top',
  },
  paymentNote: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginTop: 4,
  },
  paymentNoteLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 6,
  },
  paymentNoteValue: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: UI_COLORS.errorSoft,
    borderRadius: UI_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#EBCFC8',
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: UI_COLORS.accentRed,
    ...UI_TYPOGRAPHY.body,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_LAYOUT.screenPadding,
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
    width: 82,
    height: 82,
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
  footer: {
    position: 'absolute',
    left: UI_LAYOUT.footerSide,
    right: UI_LAYOUT.footerSide,
    bottom: UI_LAYOUT.footerBottom,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...UI_SHADOWS.floating,
  },
  footerTotalWrap: {
    flex: 1,
    paddingHorizontal: 12,
    paddingRight: 10,
  },
  footerTotalLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 4,
  },
  footerTotalValue: {
    color: UI_COLORS.textStrong,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  placeOrderButton: {
    minHeight: UI_LAYOUT.ctaHeight,
    minWidth: 152,
    backgroundColor: UI_COLORS.accentGreen,
    borderRadius: UI_RADIUS.xl,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  placeOrderButtonDisabled: {
    opacity: 0.72,
  },
  placeOrderButtonLabel: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.buttonLarge,
  },
});

export default CheckoutScreen;
