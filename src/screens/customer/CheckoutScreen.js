import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  defaultProductImage,
  getProductImageSource,
} from '../../assets/productImages';
import OrderSuccessModal from '../../components/orders/OrderSuccessModal';
import ChevronIcon from '../../components/icons/ChevronIcon';
import PrimaryButton from '../../components/PrimaryButton';
import ProductImage from '../../components/ProductImage';
import ScalePressable from '../../components/ScalePressable';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useAccountData } from '../../context/AccountDataContext';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import {
  buildCreateOrderPayload,
  submitOrder,
} from '../../services/orderService';
import {
  buildAddressFullText,
  formatPaymentMethodMeta,
  formatPaymentMethodShortLabel,
} from '../../utils/accountFormatting';
import { formatCurrency } from '../../utils/formatCurrency';

const DELIVERY_FEE = 0;
const DISCOUNT_AMOUNT = 0;
const CHECKOUT_TRUST_MICROCOPY =
  'Secure checkout · Fresh groceries guaranteed';
const COMING_SOON_BASKET_ALERT =
  'Coming soon: save this basket for next time.';

if (
  Platform.OS === 'android' &&
  typeof UIManager.setLayoutAnimationEnabledExperimental === 'function'
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function configureSummaryToggleLayout() {
  LayoutAnimation.configureNext({
    duration: 200,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

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
    <ScalePressable
      android_ripple={{ color: '#EEE6DC' }}
      onPress={onPress}
      pressScale={0.94}
      style={({ pressed }) => [
        styles.headerButton,
        pressed && styles.headerButtonPressed,
      ]}
    >
      {children}
    </ScalePressable>
  );
}

function OrderPreviewRow({ isLast = false, item, testID }) {
  return (
    <View style={[styles.previewRow, !isLast && styles.previewRowBorder]} testID={testID}>
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
  const insets = useSafeAreaInsets();
  const { items, subtotal, clearCart } = useCart();
  const { currentUser } = useApp();
  const { addCheckoutOrder, defaultAddress, defaultPaymentMethod } =
    useAccountData();
  const [customerName, setCustomerName] = useState(
    defaultAddress?.recipientName || currentUser?.name || '',
  );
  const [phone, setPhone] = useState(
    defaultAddress?.phoneNumber || currentUser?.phone || '',
  );
  const [address, setAddress] = useState(
    buildAddressFullText(defaultAddress) ||
      currentUser?.deliveryAddress ||
      '199 Grovy Street, Fresh District',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(null);

  const totalCost = useMemo(
    () => Math.max(0, subtotal + DELIVERY_FEE - DISCOUNT_AMOUNT),
    [subtotal],
  );
  const displayItems = successState?.cartItems || items;
  const displaySubtotal = successState?.subtotal ?? subtotal;
  const displayTotalCost = successState?.totalCost ?? totalCost;
  const showSuccessModal = Boolean(successState?.order);
  const itemCountLabel = `${displayItems.length} item${
    displayItems.length === 1 ? '' : 's'
  }`;
  const paymentMethodLabel = formatPaymentMethodShortLabel(defaultPaymentMethod);
  const paymentMethodMeta = formatPaymentMethodMeta(defaultPaymentMethod);
  const deliveryLocationLabel = defaultAddress?.label || 'Saved address';
  const receiverNameLabel = customerName.trim() || 'Pending';
  const receiverPhoneLabel = phone.trim() || 'Add phone number';
  const receiverAddressLabel = address.trim() || 'Add delivery address';
  const footerBottomOffset = Math.max(UI_LAYOUT.footerBottom, insets.bottom + 12);
  const contentBottomInset = footerBottomOffset + 176;

  function handleBackToHome() {
    setSuccessState(null);
    navigation.reset({
      index: 0,
      routes: [{ name: CUSTOMER_ROUTES.HOME }],
    });
  }

  function handleTrackOrder() {
    const orderId = successState?.order?.id || '';

    setSuccessState(null);

    if (!orderId) {
      navigation.reset({
        index: 1,
        routes: [
          { name: CUSTOMER_ROUTES.ACCOUNT },
          { name: CUSTOMER_ROUTES.ACCOUNT_ORDERS },
        ],
      });
      return;
    }

    navigation.reset({
      index: 2,
      routes: [
        { name: CUSTOMER_ROUTES.ACCOUNT },
        { name: CUSTOMER_ROUTES.ACCOUNT_ORDERS },
        {
          name: CUSTOMER_ROUTES.ORDER_DETAIL,
          params: { orderId },
        },
      ],
    });
  }

  function handleExploreSmartBaskets() {
    setSuccessState(null);
    navigation.reset({
      index: 0,
      routes: [
        {
          name: CUSTOMER_ROUTES.HOME,
          params: { focusSmartBaskets: true },
        },
      ],
    });
  }

  function handleShowComingSoonBasketAlert() {
    Alert.alert(COMING_SOON_BASKET_ALERT);
  }

  function handleToggleSummary() {
    configureSummaryToggleLayout();
    setIsSummaryExpanded(currentValue => !currentValue);
  }

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
        customerName,
        phone,
        address,
        cartItems: items,
        subtotal,
        totalAmount: totalCost,
        deliveryFee: DELIVERY_FEE,
        addressSnapshot: defaultAddress,
        paymentMethodSnapshot: defaultPaymentMethod,
      });
      const order = await submitOrder(orderPayload);
      const savedOrder = addCheckoutOrder(order);

      setSuccessState({
        order: savedOrder,
        cartItems: items.map(item => ({
          ...item,
        })),
        subtotal,
        totalCost,
      });
      clearCart();
    } catch (error) {
      setErrorMessage(error.message || 'Could not place your order.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (displayItems.length === 0) {
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
            <PrimaryButton
              onPress={() => navigation.navigate(CUSTOMER_ROUTES.CART)}
              style={styles.emptyActionButton}
              title="Back to cart"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        style={styles.keyboard}
      >
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
              <Text style={styles.headerEyebrow}>Checkout</Text>
              <Text style={styles.title}>Final step</Text>
              <Text style={styles.headerSubtitle}>
                Review your delivery and payment details.
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: contentBottomInset },
            ]}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.assistantCard}>
              <Text style={styles.assistantEyebrow}>Calm review</Text>
              <Text style={styles.assistantTitle}>Everything is lined up.</Text>
              <Text style={styles.assistantSubtitle}>
                Check your basket, receiver details, and payment method before
                you place the order.
              </Text>
              <View style={styles.assistantTagRow}>
                <View style={styles.assistantTag}>
                  <Text style={styles.assistantTagLabel}>{itemCountLabel}</Text>
                </View>
                <View style={styles.assistantTag}>
                  <Text style={styles.assistantTagLabel}>Delivery included</Text>
                </View>
                <View style={styles.assistantTag}>
                  <Text style={styles.assistantTagLabel}>
                    Saved preferences loaded
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.previewCard}>
              <ScalePressable
                android_ripple={{ color: '#EEE6DC' }}
                onPress={handleToggleSummary}
                pressScale={0.995}
                style={({ pressed }) => [
                  styles.orderSummaryToggle,
                  pressed && styles.orderSummaryTogglePressed,
                ]}
                testID="checkout-order-summary-toggle"
              >
                <View style={styles.orderSummaryToggleRow}>
                  <View style={styles.orderSummaryToggleCopy}>
                    <Text style={styles.orderSummaryToggleEyebrow}>
                      Order summary
                    </Text>
                    <Text style={styles.orderSummaryToggleTitle}>
                      Review your basket
                    </Text>
                    <Text style={styles.orderSummaryMeta}>
                      {itemCountLabel} ready
                      {isSummaryExpanded
                        ? ' · Hide item details'
                        : ' · Tap to review each item'}
                    </Text>
                  </View>

                  <View style={styles.orderSummaryToggleAside}>
                    <View style={styles.orderSummaryAmountPill}>
                      <Text style={styles.orderSummaryAmountValue}>
                        {formatCurrency(displayTotalCost)}
                      </Text>
                      <Text style={styles.orderSummaryAmountLabel}>total</Text>
                    </View>
                    <ChevronIcon
                      color={UI_COLORS.mutedStrong}
                      direction={isSummaryExpanded ? 'up' : 'down'}
                      size={14}
                      strokeWidth={1.8}
                    />
                  </View>
                </View>
              </ScalePressable>

              {isSummaryExpanded ? (
                <View
                  style={styles.orderSummaryItems}
                  testID="checkout-order-summary-items"
                >
                  {displayItems.map((item, index) => (
                    <OrderPreviewRow
                      isLast={index === displayItems.length - 1}
                      item={item}
                      key={item.product.id}
                      testID={`checkout-order-summary-item-${item.product.id}`}
                    />
                  ))}
                </View>
              ) : null}

              <View style={styles.orderSummaryTotals}>
                <SummaryRow
                  description={itemCountLabel}
                  label="Subtotal"
                  value={formatCurrency(displaySubtotal)}
                />
                <SummaryRow
                  emphasized
                  description={
                    DELIVERY_FEE > 0
                      ? `Includes ${formatCurrency(DELIVERY_FEE)} delivery`
                      : 'Delivery included'
                  }
                  isLast
                  label="Total"
                  value={formatCurrency(displayTotalCost)}
                />
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderCopy}>
                  <Text style={styles.sectionEyebrow}>Delivery</Text>
                  <Text style={styles.cardTitle}>Delivery details</Text>
                </View>
                <View style={[styles.sectionPill, styles.sectionPillSoft]}>
                  <Text
                    style={[styles.sectionPillLabel, styles.sectionPillLabelSoft]}
                  >
                    {DELIVERY_FEE > 0 ? formatCurrency(DELIVERY_FEE) : 'Free'}
                  </Text>
                </View>
              </View>
              <SummaryRow
                label="Address"
                description={
                  defaultAddress?.label
                    ? `${defaultAddress.label} • ${receiverAddressLabel}`
                    : receiverAddressLabel
                }
                value={deliveryLocationLabel}
              />
              <SummaryRow
                description={receiverPhoneLabel}
                isLast
                label="Receiver"
                value={receiverNameLabel}
              />
            </View>

            <View style={styles.formCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderCopy}>
                  <Text style={styles.sectionEyebrow}>For this order</Text>
                  <Text style={styles.cardTitle}>Receiver details</Text>
                </View>
              </View>
              <Text style={styles.formIntro}>
                Edit these delivery details for this order only.
              </Text>

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
                <Text style={styles.paymentNoteLabel}>Saved preferences</Text>
                <Text style={styles.paymentNoteValue}>
                  Default address and payment come from your Account settings.
                </Text>
                <Text style={styles.paymentHelpText}>
                  Editing these receiver fields updates this order only and
                  keeps your saved profile unchanged.
                </Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderCopy}>
                  <Text style={styles.sectionEyebrow}>Payment</Text>
                  <Text style={styles.cardTitle}>Payment method</Text>
                </View>
                <View style={styles.sectionPill}>
                  <Text style={styles.sectionPillLabel}>Saved</Text>
                </View>
              </View>
              <SummaryRow
                description={paymentMethodMeta}
                isLast
                label="Method"
                value={paymentMethodLabel}
              />
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderCopy}>
                  <Text style={styles.sectionEyebrow}>Promo</Text>
                  <Text style={styles.cardTitle}>Promo and discounts</Text>
                </View>
                <View
                  style={[
                    styles.sectionPill,
                    DISCOUNT_AMOUNT > 0
                      ? styles.sectionPillSoft
                      : styles.sectionPillNeutral,
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionPillLabel,
                      DISCOUNT_AMOUNT > 0
                        ? styles.sectionPillLabelSoft
                        : styles.sectionPillLabelNeutral,
                    ]}
                  >
                    {DISCOUNT_AMOUNT > 0 ? 'Applied' : 'No code'}
                  </Text>
                </View>
              </View>
              <Text style={styles.promoNote}>
                {DISCOUNT_AMOUNT > 0
                  ? 'Your discount is already included in the total below.'
                  : 'No promo code has been added to this order.'}
              </Text>
              <SummaryRow
                description={
                  DISCOUNT_AMOUNT > 0
                    ? 'Savings applied to this basket'
                    : 'Promo entry is not being used for this checkout'
                }
                isLast
                label="Discount"
                value={
                  DISCOUNT_AMOUNT > 0
                    ? formatCurrency(DISCOUNT_AMOUNT)
                    : 'None'
                }
              />
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderCopy}>
                  <Text style={styles.sectionEyebrow}>Final total</Text>
                  <Text style={styles.cardTitle}>Checkout total</Text>
                </View>
                <View style={[styles.sectionPill, styles.sectionPillSoft]}>
                  <Text
                    style={[styles.sectionPillLabel, styles.sectionPillLabelSoft]}
                  >
                    Ready
                  </Text>
                </View>
              </View>
              <SummaryRow
                description={itemCountLabel}
                label="Subtotal"
                value={formatCurrency(displaySubtotal)}
              />
              <SummaryRow
                description={
                  DELIVERY_FEE > 0
                    ? 'Calculated from your delivery option'
                    : 'Included in this order'
                }
                label="Delivery"
                value={DELIVERY_FEE > 0 ? formatCurrency(DELIVERY_FEE) : 'Free'}
              />
              <SummaryRow
                description={
                  DISCOUNT_AMOUNT > 0
                    ? 'Applied to this order'
                    : 'No active discounts'
                }
                label="Discount"
                value={
                  DISCOUNT_AMOUNT > 0
                    ? formatCurrency(DISCOUNT_AMOUNT)
                    : 'None'
                }
              />
              <SummaryRow
                emphasized
                description={`${itemCountLabel} ready for delivery`}
                isLast
                label="Total"
                value={formatCurrency(displayTotalCost)}
              />
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.footer, { bottom: footerBottomOffset }]}>
            <View style={styles.footerTotalWrap}>
              <Text style={styles.footerTotalLabel}>Final total</Text>
              <Text style={styles.footerTotalValue}>
                {formatCurrency(displayTotalCost)}
              </Text>
              <View style={styles.footerTrustRow}>
                <View style={styles.footerTrustPill}>
                  <Text style={styles.footerTrustPillLabel}>
                    {itemCountLabel}
                  </Text>
                </View>
                <Text style={styles.footerSupportText}>
                  {CHECKOUT_TRUST_MICROCOPY}
                </Text>
              </View>
            </View>

            <ScalePressable
              android_ripple={{ color: '#3D5F39' }}
              disabled={isSubmitting}
              onPress={handlePlaceOrder}
              pressScale={0.985}
              style={({ pressed }) => [
                styles.placeOrderButton,
                isSubmitting && styles.placeOrderButtonDisabled,
                pressed && !isSubmitting && styles.placeOrderButtonPressed,
              ]}
            >
              {isSubmitting ? (
                <View style={styles.placeOrderButtonContent}>
                  <ActivityIndicator
                    color={UI_COLORS.surface}
                    size="small"
                    style={styles.placeOrderLoadingIndicator}
                  />
                  <Text style={styles.placeOrderButtonLabel}>Placing order</Text>
                </View>
              ) : (
                <View style={styles.placeOrderButtonCopy}>
                  <Text style={styles.placeOrderButtonLabel}>Place order</Text>
                  <Text style={styles.placeOrderButtonHint}>
                    Confirm and send order
                  </Text>
                </View>
              )}
            </ScalePressable>
          </View>

          <OrderSuccessModal
            onBackToHome={handleBackToHome}
            onBuySimilarBasketAgain={handleShowComingSoonBasketAlert}
            onExploreSmartBaskets={handleExploreSmartBaskets}
            onRequestClose={handleBackToHome}
            onSaveBasket={handleShowComingSoonBasketAlert}
            onTrackOrder={handleTrackOrder}
            order={successState?.order || null}
            visible={showSuccessModal}
          />
        </View>
      </KeyboardAvoidingView>
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
  keyboard: {
    flex: 1,
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
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.screenTitle,
  },
  headerSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 2,
    paddingBottom: 196,
  },
  assistantCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  assistantEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.42,
    marginBottom: 6,
  },
  assistantTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
  },
  assistantSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  assistantTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  assistantTag: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  assistantTagLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  previewCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  orderSummaryToggle: {
    borderRadius: UI_RADIUS.lg,
  },
  orderSummaryTogglePressed: {
    opacity: 0.88,
  },
  orderSummaryToggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderSummaryToggleCopy: {
    flex: 1,
    paddingRight: 14,
  },
  orderSummaryToggleEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.38,
    marginBottom: 6,
  },
  orderSummaryToggleTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  orderSummaryMeta: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginTop: 4,
  },
  orderSummaryToggleAside: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  orderSummaryAmountPill: {
    borderRadius: UI_RADIUS.xl,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  orderSummaryAmountValue: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  orderSummaryAmountLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  orderSummaryItems: {
    marginTop: 16,
    borderRadius: UI_RADIUS.xl,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  orderSummaryTotals: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: UI_COLORS.border,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  previewRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: UI_COLORS.border,
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
  summaryCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderCopy: {
    flex: 1,
    paddingRight: 12,
  },
  sectionEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.38,
    marginBottom: 6,
  },
  sectionPill: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sectionPillSoft: {
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderColor: '#D6E4D2',
  },
  sectionPillNeutral: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderColor: UI_COLORS.borderSoft,
  },
  sectionPillLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.32,
  },
  sectionPillLabelSoft: {
    color: UI_COLORS.accentGreen,
  },
  sectionPillLabelNeutral: {
    color: UI_COLORS.mutedStrong,
  },
  cardTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  promoNote: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginBottom: 2,
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
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  formIntro: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginBottom: 14,
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
  emptyActionButton: {
    width: '100%',
    maxWidth: 240,
  },
  footer: {
    position: 'absolute',
    left: UI_LAYOUT.footerSide,
    right: UI_LAYOUT.footerSide,
    bottom: UI_LAYOUT.footerBottom,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...UI_SHADOWS.floating,
  },
  footerTotalWrap: {
    flex: 1,
    minWidth: 0,
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
  footerTrustRow: {
    marginTop: 6,
  },
  footerTrustPill: {
    alignSelf: 'flex-start',
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 6,
  },
  footerTrustPillLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  footerSupportText: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    lineHeight: 16,
  },
  placeOrderButton: {
    minHeight: UI_LAYOUT.ctaHeight,
    minWidth: 170,
    backgroundColor: UI_COLORS.accentGreen,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI_COLORS.accentGreen,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  placeOrderButtonDisabled: {
    opacity: 0.72,
  },
  placeOrderButtonCopy: {
    alignItems: 'center',
  },
  placeOrderButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeOrderLoadingIndicator: {
    marginRight: 10,
  },
  placeOrderButtonLabel: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.buttonLarge,
    textAlign: 'center',
  },
  placeOrderButtonHint: {
    color: 'rgba(255, 253, 252, 0.86)',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default CheckoutScreen;
