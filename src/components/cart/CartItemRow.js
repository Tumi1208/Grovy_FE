import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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

const ACTION_BUTTON_GAP = 8;
const ACTION_BUTTON_WIDTH = 86;
const ACTION_RAIL_PADDING = 10;
const ACTION_RAIL_WIDTH =
  ACTION_BUTTON_WIDTH * 2 + ACTION_BUTTON_GAP + ACTION_RAIL_PADDING * 2;
const SWIPE_ACTIVATION_OFFSET = 12;
const SWIPE_OPEN_THRESHOLD = 70;
const SWIPE_VELOCITY_THRESHOLD = 0.45;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function QuantityButton({ disabled = false, label, onPress, testID }) {
  return (
    <ScalePressable
      android_ripple={{ color: '#EEE6DC' }}
      disabled={disabled}
      onPress={onPress}
      pressScale={0.94}
      style={({ pressed }) => [
        styles.quantityButton,
        disabled && styles.quantityButtonDisabled,
        pressed && !disabled && styles.quantityButtonPressed,
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
  onClose,
  onDecrease,
  onIncrease,
  onOpen,
  onRemove,
  onSaveForLater,
}) {
  const subtitle = getProductSubtitle(item.product);
  const imageSource = getProductImageSource(item.product);
  const isAvailable = item.product.stock > 0;
  const isIncreaseDisabled =
    !isAvailable || item.quantity >= item.product.stock;
  const translateX = useRef(new Animated.Value(0)).current;
  const currentTranslateXRef = useRef(0);
  const dragStartXRef = useRef(0);

  useEffect(() => {
    const listenerId = translateX.addListener(({ value }) => {
      currentTranslateXRef.current = value;
    });

    return () => {
      translateX.removeListener(listenerId);
    };
  }, [translateX]);

  const animateTo = useCallback(
    (toValue, onAnimationEnd) => {
      if (toValue === 0) {
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

  const settleSwipe = useCallback(
    velocityX => {
      const shouldClose =
        velocityX >= SWIPE_VELOCITY_THRESHOLD ||
        currentTranslateXRef.current > -SWIPE_OPEN_THRESHOLD;

      animateTo(shouldClose ? 0 : -ACTION_RAIL_WIDTH);
    },
    [animateTo],
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

          return dx < 0 || currentTranslateXRef.current < 0;
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
            -ACTION_RAIL_WIDTH,
            0,
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

  const handleSavePress = useCallback(() => {
    animateTo(0, () => {
      onSaveForLater?.(item.product);
    });
  }, [animateTo, item.product, onSaveForLater]);

  const handleRemovePress = useCallback(() => {
    onRemove?.(item.product.id);
  }, [item.product.id, onRemove]);

  return (
    <View style={styles.rowWrap}>
      <View
        accessibilityElementsHidden={!isOpen}
        importantForAccessibility={isOpen ? 'yes' : 'no-hide-descendants'}
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={styles.actionRail}
      >
        <ScalePressable
          accessibilityLabel={`Save ${item.product.name} for later`}
          android_ripple={{ color: '#3D5F39' }}
          onPress={handleSavePress}
          pressScale={0.97}
          style={({ pressed }) => [
            styles.actionButton,
            styles.saveActionButton,
            pressed && styles.saveActionButtonPressed,
          ]}
          testID={`cart-item-save-action-${item.product.id}`}
        >
          <Text style={styles.actionButtonLabel}>Save</Text>
        </ScalePressable>

        <ScalePressable
          accessibilityLabel={`Delete ${item.product.name} from cart`}
          android_ripple={{ color: '#9D2B2B' }}
          onPress={handleRemovePress}
          pressScale={0.97}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteActionButton,
            styles.deleteActionButtonSpacing,
            pressed && styles.deleteActionButtonPressed,
          ]}
          testID={`cart-item-delete-action-${item.product.id}`}
        >
          <Text style={styles.actionButtonLabel}>Delete</Text>
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
              <Text style={styles.quantityValue}>{item.quantity}</Text>
              <QuantityButton
                disabled={isIncreaseDisabled}
                label="+"
                onPress={() => onIncrease(item.product.id)}
                testID={`cart-item-increase-${item.product.id}`}
              />
            </View>

            <View style={styles.itemPriceBlock}>
              <Text style={styles.itemPriceLabel}>Line total</Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
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
    right: 0,
    bottom: 0,
    width: ACTION_RAIL_WIDTH,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    padding: ACTION_RAIL_PADDING,
  },
  actionButton: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...UI_SHADOWS.card,
  },
  saveActionButton: {
    backgroundColor: UI_COLORS.accentGreen,
  },
  saveActionButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  deleteActionButton: {
    backgroundColor: UI_COLORS.accentRed,
  },
  deleteActionButtonPressed: {
    backgroundColor: UI_COLORS.accentRedPressed,
  },
  deleteActionButtonSpacing: {
    marginLeft: ACTION_BUTTON_GAP,
  },
  actionButtonLabel: {
    color: UI_COLORS.surface,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
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
  quantityButtonPressed: {
    opacity: 0.95,
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
  },
});

export default CartItemRow;
