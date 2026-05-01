import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getProductImage } from '../constants/productImages';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../constants/ui';
import { formatCurrency } from '../utils/formatCurrency';
import ProductImage from './ProductImage';
import ScalePressable from './ScalePressable';

const SHEET_ENTER_DURATION_MS = 220;
const SHEET_EXIT_DURATION_MS = 170;

function ActionButton({
  disabled = false,
  onPress,
  style,
  testID,
  title,
  titleStyle,
}) {
  return (
    <ScalePressable
      disabled={disabled}
      onPress={onPress}
      pressScale={0.985}
      style={({ pressed }) => [
        styles.actionButton,
        style,
        pressed && !disabled && styles.actionButtonPressed,
        disabled && styles.actionButtonDisabled,
      ]}
      testID={testID}
    >
      <Text style={[styles.actionButtonLabel, titleStyle]}>{title}</Text>
    </ScalePressable>
  );
}

function ProductQuickActionsSheet({
  isFavourite = false,
  onAddToCart,
  onAddToFavourite,
  onClose,
  onViewDetails,
  product = null,
  visible = false,
}) {
  const [isMounted, setIsMounted] = useState(visible);
  const [isClosing, setIsClosing] = useState(false);
  const skipNextEnterRef = useRef(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(28)).current;
  const isAvailable = product?.stock > 0;
  const imageSource = product?.imageSource || getProductImage(product?.imageKey);
  const favouriteLabel = isFavourite
    ? 'Saved to Favourite'
    : 'Add to Favourite';

  const animateSheet = useCallback(
    ({ isEntering, onComplete } = {}) => {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: isEntering ? 1 : 0,
          duration: isEntering
            ? SHEET_ENTER_DURATION_MS
            : SHEET_EXIT_DURATION_MS,
          easing: isEntering
            ? Easing.out(Easing.quad)
            : Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: isEntering ? 1 : 0,
          duration: isEntering
            ? SHEET_ENTER_DURATION_MS
            : SHEET_EXIT_DURATION_MS,
          easing: isEntering
            ? Easing.out(Easing.cubic)
            : Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: isEntering ? 0 : 24,
          duration: isEntering
            ? SHEET_ENTER_DURATION_MS
            : SHEET_EXIT_DURATION_MS,
          easing: isEntering
            ? Easing.out(Easing.cubic)
            : Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    },
    [overlayOpacity, sheetOpacity, sheetTranslateY],
  );

  useEffect(() => {
    if (visible) {
      if (skipNextEnterRef.current) {
        skipNextEnterRef.current = false;
        return;
      }

      setIsMounted(true);
      setIsClosing(false);
      overlayOpacity.setValue(0);
      sheetOpacity.setValue(0);
      sheetTranslateY.setValue(28);
      requestAnimationFrame(() => {
        animateSheet({ isEntering: true });
      });
      return;
    }

    if (isMounted && !isClosing) {
      animateSheet({
        isEntering: false,
        onComplete: () => {
          setIsMounted(false);
        },
      });
    }
  }, [
    isClosing,
    isMounted,
    overlayOpacity,
    sheetOpacity,
    sheetTranslateY,
    visible,
    animateSheet,
  ]);

  function handleDismiss(afterCloseAction) {
    if (isClosing) {
      return;
    }

    skipNextEnterRef.current = true;
    setIsClosing(true);
    animateSheet({
      isEntering: false,
      onComplete: () => {
        setIsMounted(false);
        setIsClosing(false);
        onClose?.();
        afterCloseAction?.();
      },
    });
  }

  const animatedOverlayStyle = useMemo(
    () => ({
      opacity: overlayOpacity,
    }),
    [overlayOpacity],
  );
  const animatedSheetStyle = useMemo(
    () => ({
      opacity: sheetOpacity,
      transform: [{ translateY: sheetTranslateY }],
    }),
    [sheetOpacity, sheetTranslateY],
  );

  if (!isMounted || !product?.id) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      onRequestClose={() => handleDismiss()}
      statusBarTranslucent
      transparent
      visible={isMounted}
    >
      <View style={styles.modalRoot} testID="product-quick-actions-modal">
        <Pressable
          onPress={() => handleDismiss()}
          style={StyleSheet.absoluteFill}
          testID="product-quick-actions-backdrop"
        >
          <Animated.View style={[styles.overlay, animatedOverlayStyle]} />
        </Pressable>

        <Animated.View style={[styles.sheet, animatedSheetStyle]}>
          <View style={styles.handle} />

          <View style={styles.productRow}>
            <View style={styles.imageWrap}>
              <ProductImage
                name={product.name}
                resizeMode="contain"
                source={imageSource}
                style={styles.image}
              />
            </View>

            <View style={styles.productCopy}>
              <Text numberOfLines={1} style={styles.categoryLabel}>
                {product.category || 'Groceries'}
              </Text>
              <Text numberOfLines={2} style={styles.productName}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>
                {formatCurrency(product.price || 0)}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <ActionButton
              disabled={!isAvailable}
              onPress={() =>
                handleDismiss(() => {
                  onAddToCart?.(product);
                })
              }
              style={[
                styles.primaryButton,
                !isAvailable && styles.primaryButtonDisabled,
              ]}
              testID="product-quick-actions-add-cart"
              title={isAvailable ? 'Add to Cart' : 'Out of Stock'}
              titleStyle={styles.primaryButtonLabel}
            />
            <ActionButton
              onPress={() =>
                handleDismiss(() => {
                  onViewDetails?.(product);
                })
              }
              style={styles.secondaryButton}
              testID="product-quick-actions-view-details"
              title="View Details"
            />
            <ActionButton
              disabled={isFavourite}
              onPress={() =>
                handleDismiss(() => {
                  onAddToFavourite?.(product);
                })
              }
              style={styles.favouriteButton}
              testID="product-quick-actions-add-favourite"
              title={favouriteLabel}
              titleStyle={styles.favouriteButtonLabel}
            />
            <ActionButton
              onPress={() => handleDismiss()}
              style={styles.cancelButton}
              testID="product-quick-actions-cancel"
              title="Cancel"
              titleStyle={styles.cancelButtonLabel}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23, 18, 15, 0.44)',
  },
  sheet: {
    backgroundColor: UI_COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    ...UI_SHADOWS.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.borderStrong,
    opacity: 0.5,
    marginBottom: 18,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  imageWrap: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  productCopy: {
    flex: 1,
  },
  categoryLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 6,
  },
  productName: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.cardTitle,
  },
  productPrice: {
    color: UI_COLORS.accentGreen,
    ...UI_TYPOGRAPHY.price,
    marginTop: 8,
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    minHeight: 54,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  actionButtonPressed: {
    opacity: 0.9,
  },
  actionButtonDisabled: {
    opacity: 0.58,
  },
  actionButtonLabel: {
    ...UI_TYPOGRAPHY.button,
    color: UI_COLORS.textStrong,
    letterSpacing: 0.1,
  },
  primaryButton: {
    backgroundColor: UI_COLORS.accentGreen,
    borderColor: UI_COLORS.accentGreen,
  },
  primaryButtonDisabled: {
    backgroundColor: UI_COLORS.surfaceTint,
    borderColor: UI_COLORS.borderSoft,
  },
  primaryButtonLabel: {
    color: UI_COLORS.surface,
  },
  secondaryButton: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderColor: UI_COLORS.borderSoft,
  },
  favouriteButton: {
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderColor: '#D6E4D2',
  },
  favouriteButtonLabel: {
    color: UI_COLORS.accentGreen,
  },
  cancelButton: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.border,
  },
  cancelButtonLabel: {
    color: UI_COLORS.mutedStrong,
  },
});

export default ProductQuickActionsSheet;
