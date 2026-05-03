import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { defaultProductImage } from '../../assets/productImages';
import ProductImage from '../../components/ProductImage';
import PrimaryButton from '../../components/PrimaryButton';
import ScalePressable from '../../components/ScalePressable';
import CartHealthCard from '../../components/cart/CartHealthCard';
import CartItemRow from '../../components/cart/CartItemRow';
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

const FEEDBACK_HIDE_DELAY_MS = 1500;
const UNDO_HIDE_DELAY_MS = 4000;

if (
  Platform.OS === 'android' &&
  typeof UIManager.setLayoutAnimationEnabledExperimental === 'function'
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function configureCartRemovalLayout() {
  LayoutAnimation.configureNext({
    duration: 220,
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

function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    addToCart,
    decreaseQuantity,
    increaseQuantity,
    items,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();
  const [openItemId, setOpenItemId] = useState(null);
  const [feedbackState, setFeedbackState] = useState({
    message: '',
    actionLabel: '',
    tone: 'success',
  });
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackTranslateY = useRef(new Animated.Value(10)).current;
  const feedbackTimeoutRef = useRef(null);
  const feedbackActionRef = useRef(null);

  const hasItems = items.length > 0;
  const totalItemsLabel = `${totalItems} item${totalItems === 1 ? '' : 's'}`;
  const subtotalLabel = formatCurrency(subtotal);

  const clearFeedbackTimer = useCallback(() => {
    if (!feedbackTimeoutRef.current) {
      return;
    }

    clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = null;
  }, []);

  const hideFeedback = useCallback(() => {
    clearFeedbackTimer();
    feedbackActionRef.current = null;

    feedbackOpacity.stopAnimation();
    feedbackTranslateY.stopAnimation();

    Animated.parallel([
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(feedbackTranslateY, {
        toValue: 10,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setFeedbackState({
          message: '',
          actionLabel: '',
          tone: 'success',
        });
      }
    });
  }, [clearFeedbackTimer, feedbackOpacity, feedbackTranslateY]);

  const showFeedback = useCallback(
    (
      message,
      {
        actionLabel = '',
        durationMs = FEEDBACK_HIDE_DELAY_MS,
        onAction = null,
        tone = 'success',
      } = {},
    ) => {
      clearFeedbackTimer();
      feedbackActionRef.current =
        typeof onAction === 'function' ? onAction : null;
      setFeedbackState({
        message,
        actionLabel,
        tone,
      });

      feedbackOpacity.stopAnimation();
      feedbackTranslateY.stopAnimation();

      Animated.parallel([
        Animated.timing(feedbackOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(feedbackTranslateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      feedbackTimeoutRef.current = setTimeout(() => {
        feedbackTimeoutRef.current = null;
        hideFeedback();
      }, durationMs);
    },
    [clearFeedbackTimer, feedbackOpacity, feedbackTranslateY, hideFeedback],
  );

  const handleFeedbackAction = useCallback(() => {
    const action = feedbackActionRef.current;

    feedbackActionRef.current = null;
    hideFeedback();
    action?.();
  }, [hideFeedback]);

  useEffect(() => {
    return () => {
      clearFeedbackTimer();
      feedbackActionRef.current = null;
      feedbackOpacity.stopAnimation();
      feedbackTranslateY.stopAnimation();
    };
  }, [clearFeedbackTimer, feedbackOpacity, feedbackTranslateY]);

  useEffect(() => {
    if (!openItemId) {
      return;
    }

    const itemStillExists = items.some(item => item.product.id === openItemId);

    if (!itemStillExists) {
      setOpenItemId(null);
    }
  }, [items, openItemId]);

  const handleOpenItem = useCallback(productId => {
    setOpenItemId(productId);
  }, []);

  const handleCloseItem = useCallback(productId => {
    setOpenItemId(currentItemId =>
      currentItemId === productId ? null : currentItemId,
    );
  }, []);

  const handleRemoveItem = useCallback(
    productId => {
      const removedItem = items.find(item => item.product.id === productId);

      if (!removedItem) {
        return;
      }

      configureCartRemovalLayout();
      setOpenItemId(currentItemId =>
        currentItemId === productId ? null : currentItemId,
      );
      removeFromCart(productId);

      showFeedback(`${removedItem.product.name} removed from cart`, {
        actionLabel: 'Undo',
        durationMs: UNDO_HIDE_DELAY_MS,
        onAction: () => {
          configureCartRemovalLayout();
          addToCart(removedItem.product, removedItem.quantity);
        },
        tone: 'destructive',
      });
    },
    [addToCart, items, removeFromCart, showFeedback],
  );

  const handleDecreaseQuantity = useCallback(
    productId => {
      const item = items.find(entry => entry.product.id === productId);

      if (!item) {
        return;
      }

      if (item.quantity <= 1) {
        configureCartRemovalLayout();
      }

      decreaseQuantity(productId);
    },
    [decreaseQuantity, items],
  );

  const handleCheckout = useCallback(() => {
    if (!items.length) {
      showFeedback('Your cart is empty.', {
        tone: 'destructive',
      });
      return;
    }

    setOpenItemId(null);
    navigation.navigate(CUSTOMER_ROUTES.CHECKOUT);
  }, [items.length, navigation, showFeedback]);

  const feedbackAnimatedStyle = {
    opacity: feedbackOpacity,
    transform: [{ translateY: feedbackTranslateY }],
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerCard}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerCopy}>
                <Text style={styles.headerEyebrow}>Grovy assistant</Text>
                <Text style={styles.headerTitle}>Ready to checkout</Text>
                <Text style={styles.headerSubtitle}>
                  Review your basket before checkout.
                </Text>
              </View>

              <View style={styles.headerPill}>
                <Text style={styles.headerPillLabel}>Basket</Text>
                <Text style={styles.headerPillValue}>{totalItems}</Text>
                <Text style={styles.headerPillMeta}>
                  item{totalItems === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            <View style={styles.headerMetaRow}>
              <View style={[styles.headerMetaCard, styles.headerMetaCardSpaced]}>
                <Text style={styles.headerMetaLabel}>Items ready</Text>
                <Text style={styles.headerMetaValue}>{totalItemsLabel}</Text>
              </View>

              <View style={styles.headerMetaCard}>
                <Text style={styles.headerMetaLabel}>Current subtotal</Text>
                <Text style={styles.headerMetaValue}>{subtotalLabel}</Text>
              </View>
            </View>
          </View>
        </View>

        {hasItems ? (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              onScrollBeginDrag={() => setOpenItemId(null)}
              showsVerticalScrollIndicator={false}
            >
              <CartHealthCard items={items} />

              {items.map(item => (
                <CartItemRow
                  isOpen={openItemId === item.product.id}
                  item={item}
                  key={item.product.id}
                  onCheckout={handleCheckout}
                  onClose={handleCloseItem}
                  onDecrease={handleDecreaseQuantity}
                  onIncrease={increaseQuantity}
                  onOpen={handleOpenItem}
                  onRemove={handleRemoveItem}
                />
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.footerSummary}>
                <Text style={styles.footerSummaryLabel}>Checkout summary</Text>
                <Text style={styles.footerSummaryValue}>{subtotalLabel}</Text>
                <View style={styles.footerMetaRow}>
                  <View style={styles.footerMetaPill}>
                    <Text style={styles.footerMetaPillLabel}>
                      {totalItemsLabel}
                    </Text>
                  </View>
                  <Text style={styles.footerSummaryNote}>
                    Delivery and payment on the next step
                  </Text>
                </View>
              </View>

              <ScalePressable
                android_ripple={{ color: '#3D5F39' }}
                onPress={handleCheckout}
                pressScale={0.985}
                style={({ pressed }) => [
                  styles.checkoutButton,
                  pressed && styles.checkoutButtonPressed,
                ]}
              >
                <View style={styles.checkoutButtonCopy}>
                  <Text style={styles.checkoutButtonLabel}>
                    Continue to checkout
                  </Text>
                  <Text style={styles.checkoutButtonHint}>
                    Review delivery and payment
                  </Text>
                </View>
              </ScalePressable>
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
              <Text style={styles.emptyEyebrow}>Smart Basket shortcut</Text>
              <Text style={styles.emptyTitle}>Your basket is empty</Text>
              <Text style={styles.emptySubtitle}>
                Try a Smart Basket to get started faster and return here ready
                to checkout.
              </Text>
              <View style={styles.emptyHintPill}>
                <Text style={styles.emptyHintPillLabel}>
                  Curated staples for a quicker checkout
                </Text>
              </View>
              <PrimaryButton
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
                style={styles.emptyActionButton}
                title="Browse Smart Baskets"
              />
            </View>
          </View>
        )}

        {feedbackState.message ? (
          <Animated.View
            pointerEvents={
              feedbackState.actionLabel ? 'box-none' : 'none'
            }
            style={[
              styles.feedbackToastContainer,
              { bottom: insets.bottom + 184 },
              feedbackAnimatedStyle,
            ]}
            testID="cart-feedback-toast"
          >
            <View
              style={[
                styles.feedbackToast,
                feedbackState.tone === 'destructive'
                  ? styles.feedbackToastDestructive
                  : styles.feedbackToastSuccess,
                feedbackState.actionLabel
                  ? styles.feedbackToastWithAction
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.feedbackToastLabel,
                  feedbackState.tone === 'destructive'
                    ? styles.feedbackToastLabelDefault
                    : styles.feedbackToastLabelSuccess,
                ]}
              >
                {feedbackState.message}
              </Text>

              {feedbackState.actionLabel ? (
                <ScalePressable
                  android_ripple={{ color: '#9D2B2B' }}
                  onPress={handleFeedbackAction}
                  pressScale={0.96}
                  style={({ pressed }) => [
                    styles.feedbackActionButton,
                    pressed && styles.feedbackActionButtonPressed,
                  ]}
                  testID="cart-feedback-toast-action"
                >
                  <Text style={styles.feedbackActionButtonLabel}>
                    {feedbackState.actionLabel}
                  </Text>
                </ScalePressable>
              ) : null}
            </View>
          </Animated.View>
        ) : null}
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
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    ...UI_SHADOWS.card,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  headerEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.42,
    marginBottom: 4,
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
  headerMetaRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  headerMetaCard: {
    flex: 1,
    borderRadius: UI_RADIUS.xl,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerMetaCardSpaced: {
    marginRight: 10,
  },
  headerMetaLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.32,
    marginBottom: 6,
  },
  headerMetaValue: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  headerPill: {
    minWidth: 86,
    borderRadius: 24,
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderWidth: 1,
    borderColor: '#D6E4D2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
    alignItems: 'center',
  },
  headerPillValue: {
    color: UI_COLORS.accentGreen,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  headerPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.32,
    marginBottom: 4,
  },
  headerPillMeta: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 6,
    paddingBottom: 214,
  },
  footer: {
    position: 'absolute',
    left: UI_LAYOUT.footerSide,
    right: UI_LAYOUT.footerSide,
    bottom: 92,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...UI_SHADOWS.floating,
  },
  footerSummary: {
    flex: 1,
    minWidth: 0,
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
  footerMetaRow: {
    marginTop: 6,
  },
  footerMetaPill: {
    alignSelf: 'flex-start',
    borderRadius: UI_RADIUS.pill,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 6,
  },
  footerMetaPillLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  footerSummaryNote: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    lineHeight: 16,
  },
  checkoutButton: {
    minHeight: UI_LAYOUT.ctaHeight,
    minWidth: 172,
    backgroundColor: UI_COLORS.accentGreen,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  checkoutButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  checkoutButtonCopy: {
    alignItems: 'center',
  },
  checkoutButtonLabel: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.buttonLarge,
    textAlign: 'center',
  },
  checkoutButtonHint: {
    color: 'rgba(255, 253, 252, 0.86)',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 2,
    textAlign: 'center',
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
  emptyEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.38,
    marginBottom: 8,
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
    marginBottom: 14,
    textAlign: 'center',
  },
  emptyHintPill: {
    borderRadius: UI_RADIUS.pill,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
  },
  emptyHintPillLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  emptyActionButton: {
    width: '100%',
    maxWidth: 260,
  },
  feedbackToastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 40,
    elevation: 10,
  },
  feedbackToast: {
    maxWidth: '84%',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    ...UI_SHADOWS.card,
  },
  feedbackToastSuccess: {
    backgroundColor: UI_COLORS.successSoft,
    borderColor: UI_COLORS.accentGreenSoft,
  },
  feedbackToastDestructive: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.accentRedSoft,
  },
  feedbackToastWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 262,
  },
  feedbackToastLabel: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  feedbackToastLabelSuccess: {
    color: UI_COLORS.successText,
  },
  feedbackToastLabelDefault: {
    color: UI_COLORS.textStrong,
    flex: 1,
    marginRight: 14,
  },
  feedbackActionButton: {
    minWidth: 74,
    backgroundColor: UI_COLORS.accentRed,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI_COLORS.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feedbackActionButtonPressed: {
    backgroundColor: UI_COLORS.accentRedPressed,
  },
  feedbackActionButtonLabel: {
    color: UI_COLORS.surface,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
});

export default CartScreen;
