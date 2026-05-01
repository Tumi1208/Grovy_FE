import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useCart } from '../../context/CartContext';
import { getCartSummary } from '../../utils/cartSummary';
import { formatCurrency } from '../../utils/formatCurrency';

const FLOATING_BOTTOM_OFFSET = 94;
const AUTO_COLLAPSE_DELAY_MS = 3000;
const EXPAND_ANIMATION_DURATION_MS = 220;
const VISIBLE_ROUTES = new Set([
  CUSTOMER_ROUTES.HOME,
  CUSTOMER_ROUTES.EXPLORE,
  CUSTOMER_ROUTES.PRODUCT_DETAIL,
  CUSTOMER_ROUTES.FAVOURITE,
]);

if (
  Platform.OS === 'android' &&
  typeof UIManager.setLayoutAnimationEnabledExperimental === 'function'
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function configureFloatingCartLayout() {
  LayoutAnimation.configureNext({
    duration: EXPAND_ANIMATION_DURATION_MS,
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

function CartGlyph() {
  return (
    <View style={styles.cartGlyph}>
      <View style={styles.cartGlyphHandle} />
      <View style={styles.cartGlyphBasket} />
      <View style={styles.cartGlyphWheelRow}>
        <View style={styles.cartGlyphWheel} />
        <View style={styles.cartGlyphWheel} />
      </View>
    </View>
  );
}

function FloatingCartButton({
  cartRouteName = CUSTOMER_ROUTES.CART,
  currentRouteName = '',
  navigation,
  onPress,
}) {
  const insets = useSafeAreaInsets();
  const { isStorageHydrated, items, subtotal, totalItems } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const collapseTimeoutRef = useRef(null);
  const previousCartSignatureRef = useRef(null);
  const expandProgress = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cartSignature = items
    .map(item => `${item?.product?.id || 'unknown'}:${item?.quantity || 1}`)
    .join('|');
  const cartSummary = getCartSummary(items);
  const resolvedTotalItems = Number.isFinite(cartSummary.totalItems)
    ? cartSummary.totalItems
    : totalItems;
  const resolvedSubtotal = Number.isFinite(cartSummary.totalPrice)
    ? cartSummary.totalPrice
    : subtotal;

  const clearCollapseTimer = useCallback(() => {
    if (!collapseTimeoutRef.current) {
      return;
    }

    clearTimeout(collapseTimeoutRef.current);
    collapseTimeoutRef.current = null;
  }, []);

  const restartCollapseTimer = useCallback(() => {
    clearCollapseTimer();
    collapseTimeoutRef.current = setTimeout(() => {
      configureFloatingCartLayout();
      setIsExpanded(false);
      collapseTimeoutRef.current = null;
    }, AUTO_COLLAPSE_DELAY_MS);
  }, [clearCollapseTimer]);

  useEffect(() => {
    return () => {
      clearCollapseTimer();
    };
  }, [clearCollapseTimer]);

  const handlePress = useCallback(() => {
    if (currentRouteName === cartRouteName) {
      return;
    }

    if (typeof navigation?.navigate === 'function') {
      navigation.navigate(cartRouteName);
      return;
    }

    if (typeof onPress === 'function') {
      onPress();
    }
  }, [cartRouteName, currentRouteName, navigation, onPress]);

  useEffect(() => {
    Animated.timing(expandProgress, {
      toValue: isExpanded ? 1 : 0,
      duration: isExpanded ? EXPAND_ANIMATION_DURATION_MS : 180,
      easing: isExpanded ? Easing.out(Easing.cubic) : Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [expandProgress, isExpanded]);

  useLayoutEffect(() => {
    if (resolvedTotalItems > 0 && VISIBLE_ROUTES.has(currentRouteName)) {
      configureFloatingCartLayout();
    }
  }, [currentRouteName, isExpanded, resolvedSubtotal, resolvedTotalItems]);

  useEffect(() => {
    if (!isStorageHydrated) {
      clearCollapseTimer();
      setIsExpanded(false);
      previousCartSignatureRef.current = null;
      return;
    }

    const previousCartSignature = previousCartSignatureRef.current;
    previousCartSignatureRef.current = cartSignature;

    if (resolvedTotalItems <= 0) {
      clearCollapseTimer();
      setIsExpanded(false);
      return;
    }

    if (previousCartSignature === null) {
      setIsExpanded(false);
      return;
    }

    if (previousCartSignature !== cartSignature) {
      configureFloatingCartLayout();
      setIsExpanded(true);
      restartCollapseTimer();
    }
  }, [
    cartSignature,
    clearCollapseTimer,
    isStorageHydrated,
    restartCollapseTimer,
    resolvedTotalItems,
  ]);

  const animateButtonScale = useCallback(
    (toValue, duration) => {
      Animated.timing(buttonScale, {
        toValue,
        duration,
        easing:
          toValue < 1
            ? Easing.out(Easing.quad)
            : Easing.bezier(0.2, 0.85, 0.25, 1),
        useNativeDriver: true,
      }).start();
    },
    [buttonScale],
  );

  const handlePressIn = useCallback(() => {
    animateButtonScale(0.97, 90);
  }, [animateButtonScale]);

  const handlePressOut = useCallback(() => {
    animateButtonScale(1, 170);
  }, [animateButtonScale]);

  if (
    resolvedTotalItems <= 0 ||
    (!navigation?.navigate && typeof onPress !== 'function') ||
    !VISIBLE_ROUTES.has(currentRouteName)
  ) {
    return null;
  }

  const itemLabel = `${resolvedTotalItems} item${
    resolvedTotalItems === 1 ? '' : 's'
  }`;
  const totalPriceLabel = formatCurrency(resolvedSubtotal);
  const accessibilityLabel = isExpanded
    ? `Open cart with ${itemLabel} totaling ${totalPriceLabel}`
    : `Open cart with ${itemLabel}`;
  const animatedButtonStyle = {
    transform: [{ scale: buttonScale }],
  };
  const animatedExpandedContentStyle = {
    opacity: expandProgress,
    transform: [
      {
        translateX: expandProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };
  const animatedCollapsedBadgeStyle = {
    opacity: expandProgress.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [1, 0.3, 0],
    }),
    transform: [
      {
        scale: expandProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.84],
        }),
      },
    ],
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          bottom: insets.bottom + FLOATING_BOTTOM_OFFSET,
        },
      ]}
    >
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        android_ripple={{ color: 'rgba(255, 255, 255, 0.16)' }}
        hitSlop={8}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID="floating-cart-button"
        style={({ pressed }) => [pressed && styles.buttonPressed]}
      >
        <Animated.View
          style={[
            styles.button,
            isExpanded ? styles.buttonExpanded : styles.buttonCollapsed,
            animatedButtonStyle,
          ]}
        >
          <View
            style={[styles.iconWrap, isExpanded && styles.iconWrapExpanded]}
          >
            <CartGlyph />
            {!isExpanded ? (
              <Animated.View
                style={[styles.countBadge, animatedCollapsedBadgeStyle]}
              >
                <View testID="floating-cart-collapsed">
                  <Text style={styles.countBadgeLabel}>
                    {resolvedTotalItems}
                  </Text>
                </View>
              </Animated.View>
            ) : null}
          </View>

          {isExpanded ? (
            <Animated.View
              style={[styles.expandedContent, animatedExpandedContentStyle]}
            >
              <View
                style={styles.expandedContentInner}
                testID="floating-cart-expanded"
              >
                <Text style={styles.label}>Cart</Text>
                <Text numberOfLines={1} style={styles.meta}>
                  {`${itemLabel} ready`}
                </Text>

                <View style={styles.pricePill}>
                  <Text style={styles.priceLabel}>{totalPriceLabel}</Text>
                </View>
              </View>
            </Animated.View>
          ) : null}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: UI_LAYOUT.bottomNavSide,
    zIndex: 80,
    elevation: 12,
  },
  button: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.accentGreen,
    borderWidth: 1,
    borderColor: UI_COLORS.accentGreenPressed,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 12,
    overflow: 'hidden',
    ...UI_SHADOWS.floating,
  },
  buttonCollapsed: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    padding: 0,
  },
  buttonExpanded: {
    minHeight: 52,
    maxWidth: 280,
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 8,
  },
  buttonPressed: {
    opacity: 0.96,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: UI_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapExpanded: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginRight: 10,
  },
  expandedContent: {
    overflow: 'hidden',
  },
  expandedContentInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  label: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.button,
  },
  meta: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
    marginLeft: 8,
    flexShrink: 1,
  },
  pricePill: {
    marginLeft: 10,
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  priceLabel: {
    color: UI_COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  cartGlyph: {
    width: 18,
    height: 16,
    alignItems: 'center',
  },
  cartGlyphHandle: {
    width: 11,
    height: 2,
    borderRadius: 1,
    backgroundColor: UI_COLORS.surface,
    alignSelf: 'flex-start',
    marginLeft: 1,
  },
  cartGlyphBasket: {
    width: 14,
    height: 8,
    borderRadius: 3,
    borderWidth: 1.6,
    borderColor: UI_COLORS.surface,
    marginTop: 1,
  },
  cartGlyphWheelRow: {
    width: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cartGlyphWheel: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: UI_COLORS.surface,
  },
  countBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: UI_COLORS.surface,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
});

export default FloatingCartButton;
