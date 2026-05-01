import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { getProductImageSource } from '../../assets/productImages';
import DirectionalHint from '../DirectionalHint';
import ProductImage from '../ProductImage';
import ScalePressable from '../ScalePressable';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductSubtitle } from '../../utils/productPresentation';

const ACTION_BUTTON_WIDTH = 102;
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

function FavouriteItemRow({
  isOpen = false,
  onAddToCart,
  onClose,
  onOpen,
  onPress,
  onRemove,
  product,
}) {
  const subtitle = getProductSubtitle(product);
  const imageSource = getProductImageSource(product);
  const isAvailable = product.stock > 0;
  const translateX = useRef(new Animated.Value(0)).current;
  const currentTranslateXRef = useRef(0);
  const dragStartXRef = useRef(0);
  const hasTriggeredSwipeActionRef = useRef(false);

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
        hasTriggeredSwipeActionRef.current = false;
        onClose?.(product.id);
      } else {
        onOpen?.(product.id);
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
    [onClose, onOpen, product.id, translateX],
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
            onRemove?.(product.id);
          });
          return;
        }

        const shouldOpenRemoveAction =
          currentTranslateX > SWIPE_OPEN_THRESHOLD ||
          velocityX > SWIPE_VELOCITY_THRESHOLD;

        animateTo(shouldOpenRemoveAction ? ACTION_OPEN_WIDTH : 0);
        return;
      }

      if (currentTranslateX < 0) {
        if (currentTranslateX <= -ACTION_AUTO_TRIGGER_DISTANCE) {
          triggerAutoSwipeAction('left', () => {
            onAddToCart?.(product);
          });
          return;
        }

        const shouldOpenAddAction =
          currentTranslateX < -SWIPE_OPEN_THRESHOLD ||
          velocityX < -SWIPE_VELOCITY_THRESHOLD;

        animateTo(shouldOpenAddAction ? -ACTION_OPEN_WIDTH : 0);
        return;
      }

      animateTo(0);
    },
    [animateTo, onAddToCart, onRemove, product, triggerAutoSwipeAction],
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

          onOpen?.(product.id);
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
    [onOpen, product.id, settleSwipe, translateX],
  );

  const handleAddPress = useCallback(() => {
    animateTo(0, () => {
      onAddToCart?.(product);
    });
  }, [animateTo, onAddToCart, product]);

  const handleRemovePress = useCallback(() => {
    onRemove?.(product.id);
  }, [onRemove, product.id]);

  const handleRowPress = useCallback(() => {
    if (Math.abs(currentTranslateXRef.current) > 8) {
      animateTo(0);
      return;
    }

    onPress?.(product);
  }, [animateTo, onPress, product]);

  return (
    <View style={styles.rowWrap}>
      <View
        accessibilityElementsHidden={!isOpen}
        importantForAccessibility={isOpen ? 'yes' : 'no-hide-descendants'}
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.actionRail, styles.leftActionRail]}
      >
        <ScalePressable
          accessibilityLabel={`Remove ${product.name} from saved items`}
          android_ripple={{ color: '#9D2B2B' }}
          onPress={handleRemovePress}
          pressScale={0.97}
          style={({ pressed }) => [
            styles.actionButton,
            styles.removeActionButton,
            pressed && styles.removeActionButtonPressed,
          ]}
          testID={`favourite-item-remove-action-${product.id}`}
        >
          <Text style={styles.actionButtonLabel}>Remove</Text>
        </ScalePressable>
      </View>

      <View
        accessibilityElementsHidden={!isOpen}
        importantForAccessibility={isOpen ? 'yes' : 'no-hide-descendants'}
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.actionRail, styles.rightActionRail]}
      >
        <ScalePressable
          accessibilityLabel={`Add ${product.name} to cart`}
          android_ripple={{ color: '#3D5F39' }}
          onPress={handleAddPress}
          pressScale={0.97}
          style={({ pressed }) => [
            styles.actionButton,
            styles.addActionButton,
            pressed && styles.addActionButtonPressed,
          ]}
          testID={`favourite-item-add-action-${product.id}`}
        >
          <Text style={styles.actionButtonLabel}>Add</Text>
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
        testID={`favourite-item-row-${product.id}`}
      >
        <ScalePressable
          android_ripple={{ color: '#EEE7DC' }}
          onPress={handleRowPress}
          pressScale={0.992}
          style={({ pressed }) => [
            styles.itemRow,
            pressed && styles.itemRowPressed,
          ]}
        >
          <View style={styles.rowTop}>
            <View style={styles.imageWrap}>
              <ProductImage
                name={product.name}
                resizeMode="contain"
                source={imageSource}
                style={styles.image}
              />
            </View>

            <View style={styles.copy}>
              <View style={styles.rowMetaRow}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillLabel}>
                    {product.category}
                  </Text>
                </View>
                <DirectionalHint
                  chevronSize={8}
                  color={UI_COLORS.mutedStrong}
                  mode="plain"
                  style={styles.rowIndicator}
                />
              </View>
              <Text numberOfLines={2} style={styles.name}>
                {product.name}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {subtitle}
              </Text>
              <Text
                style={[
                  styles.availability,
                  isAvailable
                    ? styles.availabilityInStock
                    : styles.availabilityOutOfStock,
                ]}
              >
                {isAvailable ? `${product.stock} available` : 'Unavailable'}
              </Text>
            </View>
          </View>

          <View style={styles.rowFooter}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            </View>

            <View style={styles.swipeHintPill}>
              <Text style={styles.swipeHintLabel}>Swipe for actions</Text>
            </View>
          </View>
        </ScalePressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    marginBottom: 14,
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
  addActionButton: {
    backgroundColor: UI_COLORS.accentGreen,
  },
  addActionButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  removeActionButton: {
    backgroundColor: UI_COLORS.accentRed,
  },
  removeActionButtonPressed: {
    backgroundColor: UI_COLORS.accentRedPressed,
  },
  actionButtonLabel: {
    color: UI_COLORS.surface,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  itemRowAnimated: {
    ...UI_SHADOWS.card,
  },
  itemRow: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 17,
  },
  itemRowPressed: {
    opacity: 0.98,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  image: {
    width: 62,
    height: 62,
  },
  copy: {
    flex: 1,
  },
  rowMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  rowIndicator: {
    marginLeft: 8,
  },
  name: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 4,
  },
  meta: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginBottom: 6,
  },
  availability: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  availabilityInStock: {
    color: UI_COLORS.accentGreen,
  },
  availabilityOutOfStock: {
    color: UI_COLORS.accentRed,
  },
  rowFooter: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 4,
  },
  price: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  swipeHintPill: {
    marginLeft: 16,
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  swipeHintLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
});

export default FavouriteItemRow;
