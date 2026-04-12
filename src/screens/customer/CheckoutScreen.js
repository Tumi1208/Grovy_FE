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
import {
  defaultProductImage,
  getProductImageSource,
} from '../../assets/productImages';
import ChevronIcon from '../../components/icons/ChevronIcon';
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

function SummaryRow({
  description,
  emphasized = false,
  isLast = false,
  label,
  value,
}) {
  return (
    <View style={[styles.summaryRow, !isLast && styles.summaryRowBorder]}>
      <View style={styles.summaryCopy}>
        <Text
          style={[
            styles.summaryLabel,
            emphasized && styles.summaryLabelEmphasized,
          ]}
        >
          {label}
        </Text>
        {description ? (
          <Text style={styles.summaryDescription}>{description}</Text>
        ) : null}
      </View>
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

function OrderPreviewRow({ item }) {
  return (
    <View style={styles.previewRow}>
      <View style={styles.previewImageWrap}>
        <ProductImage
          name={item.product.name}
          resizeMode="contain"
          source={getProductImageSource(item.product)}
          style={styles.previewImage}
        />
      </View>

      <View style={styles.previewCopy}>
        <Text numberOfLines={1} style={styles.previewName}>
          {item.product.name}
        </Text>
        <Text style={styles.previewMeta}>
          {item.quantity} x {formatCurrency(item.product.price)}
        </Text>
      </View>

      <Text style={styles.previewPrice}>
        {formatCurrency(item.product.price * item.quantity)}
      </Text>
    </View>
  );
}

function CheckoutScreen({ navigation }) {
  const { items, subtotal, clearCart } = useCart();
  const { currentUser } = useApp();
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(
    currentUser?.deliveryAddress || '199 Grovy Street, Fresh District',
  );
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
            <ChevronIcon
              color={UI_COLORS.textStrong}
              direction="left"
              size={12}
              strokeWidth={1.9}
            />
          </HeaderButton>

          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>Final step</Text>
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
          <View style={styles.previewCard}>
            <View style={styles.cardHeadingRow}>
              <Text style={styles.cardTitle}>In your order</Text>
              <Text style={styles.cardMeta}>{items.length} items</Text>
            </View>

            {items.slice(0, 3).map(item => (
              <OrderPreviewRow item={item} key={item.product.id} />
            ))}

            {items.length > 3 ? (
              <Text style={styles.previewMoreLabel}>
                +{items.length - 3} more item{items.length - 3 === 1 ? '' : 's'}
              </Text>
            ) : null}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Delivery and payment</Text>

            <SummaryRow
              label="Delivery"
              description={address}
              value={DELIVERY_FEE > 0 ? formatCurrency(DELIVERY_FEE) : 'Free'}
            />
            <SummaryRow
              label="Payment"
              description="Cash on delivery"
              value="Cash"
            />
            <SummaryRow
              label="Promo"
              description={
                DISCOUNT_AMOUNT > 0
                  ? 'Discount has been applied'
                  : 'No promo code added'
              }
              value={
                DISCOUNT_AMOUNT > 0 ? formatCurrency(DISCOUNT_AMOUNT) : 'None'
              }
            />

            <SummaryRow
              emphasized
              description={`${items.length} item${
                items.length === 1 ? '' : 's'
              } • Subtotal ${formatCurrency(subtotal)}`}
              isLast
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
              <Text style={styles.paymentNoteLabel}>Order note</Text>
              <Text style={styles.paymentNoteValue}>
                We&apos;ll use these details to confirm delivery.
              </Text>
              <Text style={styles.paymentHelpText}>
                Keep your phone nearby so the courier can reach you if needed.
              </Text>
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
    backgroundColor: UI_COLORS.screenLight,
  },
  screen: {
    flex: 1,
    backgroundColor: UI_COLORS.screenLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
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
  headerCopy: {
    flex: 1,
  },
  headerEyebrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 4,
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
    paddingTop: 2,
    paddingBottom: 168,
  },
  previewCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  cardHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardMeta: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  previewImageWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewImage: {
    width: 38,
    height: 38,
  },
  previewCopy: {
    flex: 1,
    paddingRight: 10,
  },
  previewName: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  previewMeta: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
  },
  previewPrice: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  previewMoreLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
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
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  summaryRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: UI_COLORS.border,
  },
  summaryCopy: {
    flex: 1,
    paddingRight: 14,
  },
  summaryLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 15,
    lineHeight: 20,
  },
  summaryDescription: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
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
  formCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
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
    backgroundColor: '#FBF8F4',
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
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
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
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
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  paymentHelpText: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 9,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI_COLORS.accentGreen,
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
