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
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>Grovy assistant</Text>
            <Text style={styles.headerTitle}>Ready to checkout</Text>
            <Text style={styles.headerSubtitle}>
              Review your basket before checkout.
            </Text>
          </View>

          <View style={styles.headerPill}>
            <Text style={styles.headerPillValue}>{totalItems}</Text>
            <Text style={styles.headerPillLabel}>
              item{totalItems === 1 ? '' : 's'}
            </Text>
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
                <Text style={styles.footerSummaryLabel}>Subtotal</Text>
                <Text style={styles.footerSummaryValue}>
                  {formatCurrency(subtotal)}
                </Text>
                <Text style={styles.footerSummaryNote}>
                  Delivery, payment, and final order review on the next step
                </Text>
              </View>

              <ScalePressable
                android_ripple={{ color: '#3D5F39' }}
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.CHECKOUT)}
                pressScale={0.985}
                style={({ pressed }) => [
                  styles.checkoutButton,
                  pressed && styles.checkoutButtonPressed,
                ]}
              >
                <Text style={styles.checkoutButtonLabel}>
                  Continue to checkout
                </Text>
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
              <Text style={styles.emptyTitle}>Your basket is empty</Text>
              <Text style={styles.emptySubtitle}>
                Try a Smart Basket to get started faster.
              </Text>
              <ScalePressable
                android_ripple={{ color: '#3D5F39' }}
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
                pressScale={0.985}
                style={({ pressed }) => [
                  styles.emptyStateButton,
                  pressed && styles.emptyStateButtonPressed,
                ]}
              >
                <Text style={styles.emptyStateButtonLabel}>
                  Browse Smart Baskets
                </Text>
              </ScalePressable>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 10,
    paddingBottom: 18,
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
  headerPill: {
    minWidth: 72,
    borderRadius: 24,
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderWidth: 1,
    borderColor: '#D6E4D2',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 6,
    alignItems: 'center',
    ...UI_SHADOWS.card,
  },
  headerPillValue: {
    color: UI_COLORS.accentGreen,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  headerPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 2,
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
    padding: 9,
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
  footerSummaryNote: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    maxWidth: 172,
  },
  checkoutButton: {
    minHeight: UI_LAYOUT.ctaHeight,
    minWidth: 176,
    backgroundColor: UI_COLORS.accentGreen,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI_COLORS.accentGreen,
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
    width: '100%',
    maxWidth: 260,
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
