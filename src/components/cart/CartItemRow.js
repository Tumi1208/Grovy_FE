import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { getProductImageSource } from '../../assets/productImages';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import ProductImage from '../ProductImage';
import ScalePressable from '../ScalePressable';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductSubtitle } from '../../utils/productPresentation';

const ACTION_BUTTON_WIDTH = 104;
const ACTION_RAIL_PADDING = 10;
const ACTION_OPEN_WIDTH = ACTION_BUTTON_WIDTH + ACTION_RAIL_PADDING * 2;
const ACTION_AUTO_TRIGGER_DISTANCE = 118;
const ACTION_AUTO_TRAVEL = 168;
const SWIPE_ACTIVATION_OFFSET = 12;
const SWIPE_OPEN_THRESHOLD = 58;
const SWIPE_VELOCITY_THRESHOLD = 0.45;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function QuantityButton({
  disabled = false,
  isAccent = false,
  label,
  onPress,
  testID,
}) {
  return (
    <ScalePressable
      android_ripple={{ color: '#EEE6DC' }}
      disabled={disabled}
      onPress={onPress}
      pressScale={0.91}
      style={({ pressed }) => [
        styles.quantityButton,
        isAccent && styles.quantityButtonAccent,
        disabled && styles.quantityButtonDisabled,
        pressed && !disabled && styles.quantityButtonPressed,
        pressed && !disabled && isAccent && styles.quantityButtonPressedAccent,
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.quantityButtonText,
          label === '+' ? styles.quantityButtonTextAccent : null,
        ]}
      >
        {label}
      </Text>
    </ScalePressable>
  );
}

function CartItemRow({
  isOpen = false,
  item,
  onCheckout,
  onClose,
  onDecrease,
  onIncrease,
  onOpen,
  onRemove,
}) {
  const subtitle = getProductSubtitle(item.product);
  const imageSource = getProductImageSource(item.product);
  const isAvailable = item.product.stock > 0;
  const isIncreaseDisabled =
    !isAvailable || item.quantity >= item.product.stock;
  const totalPriceLabel = useMemo(
    () => formatCurrency(item.product.price * item.quantity),
    [item.product.price, item.quantity],
  );
  const translateX = useRef(new Animated.Value(0)).current;
  const quantityScale = useRef(new Animated.Value(1)).current;
  const lineTotalScale = useRef(new Animated.Value(1)).current;
  const lineTotalIncomingOpacity = useRef(new Animated.Value(1)).current;
  const lineTotalIncomingTranslateY = useRef(new Animated.Value(0)).current;
  const lineTotalOutgoingOpacity = useRef(new Animated.Value(0)).current;
  const lineTotalOutgoingTranslateY = useRef(new Animated.Value(0)).current;
  const currentTranslateXRef = useRef(0);
  const dragStartXRef = useRef(0);
  const hasTriggeredSwipeActionRef = useRef(false);
  const previousQuantityRef = useRef(item.quantity);
  const currentLineTotalLabelRef = useRef(totalPriceLabel);
  const [lineTotalLabel, setLineTotalLabel] = useState(totalPriceLabel);
  const [outgoingLineTotalLabel, setOutgoingLineTotalLabel] = useState('');

  useEffect(() => {
    const listenerId = translateX.addListener(({ value }) => {
      currentTranslateXRef.current = value;
    });

    return () => {
      translateX.removeListener(listenerId);
    };
  }, [translateX]);

  const animateQuantityValue = useCallback(() => {
    quantityScale.stopAnimation();
    quantityScale.setValue(1);

    Animated.sequence([
      Animated.timing(quantityScale, {
        toValue: 1.15,
        duration: 95,
        useNativeDriver: true,
      }),
      Animated.spring(quantityScale, {
        toValue: 1,
        bounciness: 7,
        speed: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, [quantityScale]);

  const animateLineTotalValue = useCallback(
    nextLabel => {
      const currentLabel = currentLineTotalLabelRef.current;

      if (currentLabel === nextLabel) {
        setLineTotalLabel(nextLabel);
        setOutgoingLineTotalLabel('');
        return;
      }

      lineTotalScale.stopAnimation();
      lineTotalIncomingOpacity.stopAnimation();
      lineTotalIncomingTranslateY.stopAnimation();
      lineTotalOutgoingOpacity.stopAnimation();
      lineTotalOutgoingTranslateY.stopAnimation();

      currentLineTotalLabelRef.current = nextLabel;
      setOutgoingLineTotalLabel(currentLabel);
      setLineTotalLabel(nextLabel);

      lineTotalScale.setValue(0.96);
      lineTotalIncomingOpacity.setValue(0);
      lineTotalIncomingTranslateY.setValue(7);
      lineTotalOutgoingOpacity.setValue(1);
      lineTotalOutgoingTranslateY.setValue(0);

      Animated.parallel([
        Animated.spring(lineTotalScale, {
          toValue: 1,
          bounciness: 6,
          speed: 18,
          useNativeDriver: true,
        }),
        Animated.timing(lineTotalIncomingOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(lineTotalIncomingTranslateY, {
          toValue: 0,
          bounciness: 4,
          speed: 20,
          useNativeDriver: true,
        }),
        Animated.timing(lineTotalOutgoingOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(lineTotalOutgoingTranslateY, {
          toValue: -6,
          duration: 130,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setOutgoingLineTotalLabel('');
      });
    },
    [
      lineTotalIncomingOpacity,
      lineTotalIncomingTranslateY,
      lineTotalOutgoingOpacity,
      lineTotalOutgoingTranslateY,
      lineTotalScale,
    ],
  );

  useEffect(() => {
    if (previousQuantityRef.current === item.quantity) {
      return;
    }

    previousQuantityRef.current = item.quantity;
    animateQuantityValue();
    animateLineTotalValue(totalPriceLabel);
  }, [animateLineTotalValue, animateQuantityValue, item.quantity, totalPriceLabel]);

  useEffect(() => {
    return () => {
      quantityScale.stopAnimation();
      lineTotalScale.stopAnimation();
      lineTotalIncomingOpacity.stopAnimation();
      lineTotalIncomingTranslateY.stopAnimation();
      lineTotalOutgoingOpacity.stopAnimation();
      lineTotalOutgoingTranslateY.stopAnimation();
    };
  }, [
    lineTotalIncomingOpacity,
    lineTotalIncomingTranslateY,
    lineTotalOutgoingOpacity,
    lineTotalOutgoingTranslateY,
    lineTotalScale,
    quantityScale,
  ]);

  const animateTo = useCallback(
    (toValue, onAnimationEnd) => {
      if (toValue === 0) {
        hasTriggeredSwipeActionRef.current = false;
        onClose?.(item.product.id);
      } else {
        onOpen?.(item.product.id);
      }

      Animated.spring(translateX, {
        toValue,
        bounciness: 0,
        overshootClamping: true,
        speed: 18,
        useNativeDriver: true,
      }).start(({ finished }) => {
        currentTranslateXRef.current = toValue;

        if (finished) {
          onAnimationEnd?.();
        }
      });
    },
    [item.product.id, onClose, onOpen, translateX],
  );

  const triggerAutoSwipeAction = useCallback(
    (direction, action) => {
      if (hasTriggeredSwipeActionRef.current) {
        return;
      }

      hasTriggeredSwipeActionRef.current = true;

      animateTo(direction === 'right' ? ACTION_AUTO_TRAVEL : -ACTION_AUTO_TRAVEL, () => {
        action?.();
      });
    },
    [animateTo],
  );

  const settleSwipe = useCallback(
    velocityX => {
      if (hasTriggeredSwipeActionRef.current) {
        return;
      }

      const currentTranslateX = currentTranslateXRef.current;

      if (currentTranslateX > 0) {
        if (currentTranslateX >= ACTION_AUTO_TRIGGER_DISTANCE) {
          triggerAutoSwipeAction('right', () => {
            onRemove?.(item.product.id);
          });
          return;
        }

        const shouldOpenDeleteAction =
          currentTranslateX > SWIPE_OPEN_THRESHOLD ||
          velocityX > SWIPE_VELOCITY_THRESHOLD;

        animateTo(shouldOpenDeleteAction ? ACTION_OPEN_WIDTH : 0);
        return;
      }

      if (currentTranslateX < 0) {
        if (currentTranslateX <= -ACTION_AUTO_TRIGGER_DISTANCE) {
          triggerAutoSwipeAction('left', () => {
            onCheckout?.();
          });
          return;
        }

        const shouldOpenCheckoutAction =
          currentTranslateX < -SWIPE_OPEN_THRESHOLD ||
          velocityX < -SWIPE_VELOCITY_THRESHOLD;

        animateTo(shouldOpenCheckoutAction ? -ACTION_OPEN_WIDTH : 0);
        return;
      }

      animateTo(0);
    },
    [animateTo, item.product.id, onCheckout, onRemove, triggerAutoSwipeAction],
  );

  useEffect(() => {
    if (!isOpen && currentTranslateXRef.current !== 0) {
      animateTo(0);
    }
  }, [animateTo, isOpen]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const { dx, dy } = gestureState;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);
          const isHorizontalIntent =
            absDx > SWIPE_ACTIVATION_OFFSET && absDx > absDy * 1.25;

          if (!isHorizontalIntent) {
            return false;
          }

          return true;
        },
        onPanResponderGrant: () => {
          translateX.stopAnimation(value => {
            currentTranslateXRef.current = value;
            dragStartXRef.current = value;
          });

          onOpen?.(item.product.id);
        },
        onPanResponderMove: (_, gestureState) => {
          const nextValue = clamp(
            dragStartXRef.current + gestureState.dx,
            -ACTION_AUTO_TRAVEL,
            ACTION_AUTO_TRAVEL,
          );

          translateX.setValue(nextValue);
        },
        onPanResponderRelease: (_, gestureState) => {
          settleSwipe(gestureState.vx);
        },
        onPanResponderTerminate: (_, gestureState) => {
          settleSwipe(gestureState.vx);
        },
        onPanResponderTerminationRequest: () => true,
      }),
    [item.product.id, onOpen, settleSwipe, translateX],
  );

  const handleCheckoutPress = useCallback(() => {
    animateTo(0, () => {
      onCheckout?.();
    });
  }, [animateTo, onCheckout]);

  const handleRemovePress = useCallback(() => {
    onRemove?.(item.product.id);
  }, [item.product.id, onRemove]);

  const animatedQuantityValueStyle = {
    transform: [{ scale: quantityScale }],
  };
  const animatedIncomingLineTotalStyle = {
    opacity: lineTotalIncomingOpacity,
    transform: [{ scale: lineTotalScale }, { translateY: lineTotalIncomingTranslateY }],
  };
  const animatedOutgoingLineTotalStyle = {
    opacity: lineTotalOutgoingOpacity,
    transform: [{ translateY: lineTotalOutgoingTranslateY }],
  };

  return (
    <View style={styles.rowWrap}>
      <View
        accessibilityElementsHidden={!isOpen}
        importantForAccessibility={isOpen ? 'yes' : 'no-hide-descendants'}
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.actionRail, styles.leftActionRail]}
      >
        <ScalePressable
          accessibilityLabel={`Delete ${item.product.name} from cart`}
          android_ripple={{ color: '#9D2B2B' }}
          onPress={handleRemovePress}
          pressScale={0.97}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteActionButton,
            pressed && styles.deleteActionButtonPressed,
          ]}
          testID={`cart-item-delete-action-${item.product.id}`}
        >
          <Text style={styles.actionButtonLabel}>Delete</Text>
        </ScalePressable>
      </View>

      <View
        accessibilityElementsHidden={!isOpen}
        importantForAccessibility={isOpen ? 'yes' : 'no-hide-descendants'}
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.actionRail, styles.rightActionRail]}
      >
        <ScalePressable
          accessibilityLabel={`Checkout with ${item.product.name} in cart`}
          android_ripple={{ color: '#3D5F39' }}
          onPress={handleCheckoutPress}
          pressScale={0.97}
          style={({ pressed }) => [
            styles.actionButton,
            styles.checkoutActionButton,
            pressed && styles.checkoutActionButtonPressed,
          ]}
          testID={`cart-item-checkout-action-${item.product.id}`}
        >
          <Text style={styles.actionButtonLabel}>Checkout</Text>
        </ScalePressable>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.itemRowAnimated,
          {
            transform: [{ translateX }],
          },
        ]}
        testID={`cart-item-row-${item.product.id}`}
      >
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
              <View style={styles.itemMetaRow}>
                <View style={styles.itemCategoryPill}>
                  <Text style={styles.itemCategoryLabel}>
                    {item.product.category}
                  </Text>
                </View>
              </View>
              <Text numberOfLines={2} style={styles.itemName}>
                {item.product.name}
              </Text>
              <Text numberOfLines={1} style={styles.itemSubtitle}>
                {subtitle}
              </Text>
              <View style={styles.itemInfoRow}>
                <Text
                  style={[
                    styles.itemStock,
                    !isAvailable && styles.itemStockUnavailable,
                  ]}
                >
                  {isAvailable
                    ? `${item.product.stock} available`
                    : 'Unavailable'}
                </Text>
                <Text style={styles.itemEachPrice}>
                  Each {formatCurrency(item.product.price)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.quantityGroup}>
              <QuantityButton
                label="-"
                onPress={() => onDecrease(item.product.id)}
                testID={`cart-item-decrease-${item.product.id}`}
              />
              <Animated.Text
                style={[styles.quantityValue, animatedQuantityValueStyle]}
                testID={`cart-item-quantity-value-${item.product.id}`}
              >
                {item.quantity}
              </Animated.Text>
              <QuantityButton
                disabled={isIncreaseDisabled}
                isAccent
                label="+"
                onPress={() => onIncrease(item.product.id)}
                testID={`cart-item-increase-${item.product.id}`}
              />
            </View>

            <View style={styles.itemPriceBlock}>
              <Text style={styles.itemPriceLabel}>Line total</Text>
              <View style={styles.itemPriceValueWrap}>
                {outgoingLineTotalLabel ? (
                  <Animated.Text
                    style={[
                      styles.itemPrice,
                      styles.itemPriceOverlay,
                      animatedOutgoingLineTotalStyle,
                    ]}
                  >
                    {outgoingLineTotalLabel}
                  </Animated.Text>
                ) : null}
                <Animated.Text
                  style={[styles.itemPrice, animatedIncomingLineTotalStyle]}
                  testID={`cart-item-line-total-${item.product.id}`}
                >
                  {lineTotalLabel}
                </Animated.Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    marginBottom: 16,
  },
  actionRail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: ACTION_AUTO_TRAVEL,
    padding: ACTION_RAIL_PADDING,
    justifyContent: 'center',
  },
  leftActionRail: {
    left: 0,
  },
  rightActionRail: {
    right: 0,
  },
  actionButton: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    ...UI_SHADOWS.card,
  },
  deleteActionButton: {
    backgroundColor: UI_COLORS.accentRed,
  },
  deleteActionButtonPressed: {
    backgroundColor: UI_COLORS.accentRedPressed,
  },
  checkoutActionButton: {
    backgroundColor: UI_COLORS.accentGreen,
  },
  checkoutActionButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  actionButtonLabel: {
    color: UI_COLORS.surface,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  itemRowAnimated: {
    ...UI_SHADOWS.card,
  },
  itemRow: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageWrap: {
    width: 82,
    height: 82,
    borderRadius: 22,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemImage: {
    width: 64,
    height: 64,
  },
  itemCopy: {
    flex: 1,
  },
  itemMetaRow: {
    marginBottom: 10,
  },
  itemCategoryPill: {
    alignSelf: 'flex-start',
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  itemCategoryLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  itemName: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 6,
  },
  itemSubtitle: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  itemInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemStock: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  itemStockUnavailable: {
    color: UI_COLORS.accentRed,
  },
  itemEachPrice: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    lineHeight: 16,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quantityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  quantityButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonAccent: {
    borderColor: UI_COLORS.accentGreenSoft,
  },
  quantityButtonPressed: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderColor: UI_COLORS.border,
  },
  quantityButtonPressedAccent: {
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderColor: UI_COLORS.accentGreen,
  },
  quantityButtonDisabled: {
    opacity: 0.45,
  },
  quantityButtonText: {
    color: UI_COLORS.mutedStrong,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 22,
  },
  quantityButtonTextAccent: {
    color: UI_COLORS.accentGreen,
  },
  quantityValue: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  itemPriceBlock: {
    alignItems: 'flex-end',
    marginLeft: 16,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemPriceLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 4,
  },
  itemPrice: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'right',
  },
  itemPriceValueWrap: {
    minHeight: 26,
    justifyContent: 'center',
  },
  itemPriceOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});

export default CartItemRow;
