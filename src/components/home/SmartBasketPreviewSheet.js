import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { getProductImage } from '../../constants/productImages';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { formatCurrency } from '../../utils/formatCurrency';
import PrimaryButton from '../PrimaryButton';
import ProductImage from '../ProductImage';
import ScalePressable from '../ScalePressable';

const SHEET_ENTER_DURATION_MS = 220;
const SHEET_EXIT_DURATION_MS = 170;

function getResolvedProducts(collection) {
  if (Array.isArray(collection?.previewProducts)) {
    return collection.previewProducts.filter(Boolean);
  }

  if (Array.isArray(collection?.products)) {
    return collection.products.filter(Boolean);
  }

  return [];
}

function getEstimatedTotal(collection, resolvedProducts) {
  const configuredTotal = Number(collection?.estimatedTotal);

  if (Number.isFinite(configuredTotal) && configuredTotal >= 0) {
    return configuredTotal;
  }

  const total = resolvedProducts.reduce((sum, product) => {
    const price = Number(product?.price);

    return Number.isFinite(price) && price > 0 && product?.stock > 0
      ? sum + price
      : sum;
  }, 0);

  return Number(total.toFixed(2));
}

function SummaryCard({ label, value }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function BasketProductRow({ onPress, product }) {
  const isAvailable = product?.stock > 0;
  const imageSource = getProductImage(product?.imageKey);

  return (
    <ScalePressable
      android_ripple={{ color: '#EFE6DA' }}
      disabled={!product?.id || typeof onPress !== 'function'}
      onPress={() => onPress?.(product)}
      pressScale={0.992}
      style={({ pressed }) => [
        styles.productRow,
        pressed &&
          product?.id &&
          typeof onPress === 'function' &&
          styles.productRowPressed,
      ]}
      testID={product?.id ? `smart-basket-preview-item-${product.id}` : undefined}
    >
      <View style={styles.productImageWrap}>
        <ProductImage
          name={product?.name}
          resizeMode="contain"
          source={imageSource}
          style={styles.productImage}
        />
      </View>

      <View style={styles.productCopy}>
        <Text numberOfLines={2} style={styles.productName}>
          {product?.name || 'Unnamed product'}
        </Text>
        <Text numberOfLines={1} style={styles.productMeta}>
          {product?.category || 'Groceries'}
        </Text>
      </View>

      <View style={styles.productMetaColumn}>
        <Text style={styles.productPrice}>
          {formatCurrency(product?.price || 0)}
        </Text>
        <View
          style={[
            styles.productStatusPill,
            isAvailable
              ? styles.productStatusPillAvailable
              : styles.productStatusPillUnavailable,
          ]}
        >
          <Text
            style={[
              styles.productStatusLabel,
              isAvailable
                ? styles.productStatusLabelAvailable
                : styles.productStatusLabelUnavailable,
            ]}
          >
            {isAvailable ? 'Ready' : 'Out of stock'}
          </Text>
        </View>
      </View>
    </ScalePressable>
  );
}

function SmartBasketPreviewSheet({
  collection = null,
  onAddAll,
  onClose,
  onSelectProduct,
  visible = false,
}) {
  const { height } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const [isClosing, setIsClosing] = useState(false);
  const skipNextEnterRef = useRef(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(28)).current;
  const resolvedProducts = getResolvedProducts(collection);
  const addableCount =
    Number(collection?.addableCount) ||
    resolvedProducts.filter(product => product?.id && product?.stock > 0).length;
  const missingCount = Number(collection?.missingCount) || 0;
  const unavailableCount =
    Number(collection?.unavailableCount) ||
    resolvedProducts.filter(product => product?.stock <= 0).length;
  const estimatedTotal = getEstimatedTotal(collection, resolvedProducts);

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
    animateSheet,
    isClosing,
    isMounted,
    overlayOpacity,
    sheetOpacity,
    sheetTranslateY,
    visible,
  ]);

  const handleDismiss = useCallback(
    afterCloseAction => {
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
    },
    [animateSheet, isClosing, onClose],
  );

  const animatedOverlayStyle = useMemo(
    () => ({
      opacity: overlayOpacity,
    }),
    [overlayOpacity],
  );
  const animatedSheetStyle = useMemo(
    () => ({
      maxHeight: Math.min(height * 0.82, 620),
      opacity: sheetOpacity,
      transform: [{ translateY: sheetTranslateY }],
    }),
    [height, sheetOpacity, sheetTranslateY],
  );

  if (!isMounted || !collection) {
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
      <View style={styles.modalRoot}>
        <Pressable
          onPress={() => handleDismiss()}
          style={StyleSheet.absoluteFill}
          testID="smart-basket-preview-backdrop"
        >
          <Animated.View style={[styles.overlay, animatedOverlayStyle]} />
        </Pressable>

        <Animated.View
          style={[styles.sheet, animatedSheetStyle]}
          testID="smart-basket-preview-modal"
        >
          <View style={styles.handle} />

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            <Text style={styles.eyebrow}>Smart basket preview</Text>
            <Text style={styles.title}>{collection.title || 'Smart basket'}</Text>
            {collection.subtitle ? (
              <Text style={styles.subtitle}>{collection.subtitle}</Text>
            ) : null}

            <View style={styles.summaryRow}>
              <SummaryCard
                label="Resolved"
                value={`${resolvedProducts.length} item${
                  resolvedProducts.length === 1 ? '' : 's'
                }`}
              />
              <SummaryCard
                label="Ready"
                value={`${addableCount} item${addableCount === 1 ? '' : 's'}`}
              />
              <SummaryCard
                label="Est. total"
                value={formatCurrency(estimatedTotal)}
              />
            </View>

            <View style={styles.listCard}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Resolved products</Text>
                {typeof onSelectProduct === 'function' ? (
                  <Text style={styles.listHint}>Tap an item for details</Text>
                ) : null}
              </View>

              {resolvedProducts.length ? (
                resolvedProducts.map(product => (
                  <BasketProductRow
                    key={product.id}
                    onPress={selectedProduct =>
                      handleDismiss(() => onSelectProduct?.(selectedProduct))
                    }
                    product={product}
                  />
                ))
              ) : (
                <Text style={styles.emptyStateText}>
                  No matching products are available right now.
                </Text>
              )}
            </View>

            {missingCount > 0 || unavailableCount > 0 ? (
              <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>Availability notes</Text>
                {missingCount > 0 ? (
                  <Text style={styles.noteText}>
                    {missingCount} configured item
                    {missingCount === 1 ? '' : 's'} could not be matched.
                  </Text>
                ) : null}
                {unavailableCount > 0 ? (
                  <Text style={styles.noteText}>
                    {unavailableCount} product
                    {unavailableCount === 1 ? '' : 's'} are out of stock and
                    won&apos;t be added.
                  </Text>
                ) : null}
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.buttonStack}>
            <PrimaryButton
              disabled={addableCount <= 0}
              onPress={() => onAddAll?.(collection)}
              style={styles.primaryButton}
              title={addableCount > 0 ? 'Add all to cart' : 'No items available'}
            />
            <PrimaryButton
              onPress={() => handleDismiss()}
              title="Close"
              variant="secondary"
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
    backgroundColor: 'rgba(23, 18, 15, 0.48)',
  },
  sheet: {
    backgroundColor: UI_COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: UI_COLORS.border,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    ...UI_SHADOWS.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.borderStrong,
    opacity: 0.55,
    marginBottom: 18,
  },
  scrollView: {
    flexGrow: 0,
  },
  eyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.45,
    marginBottom: 8,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 18,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: UI_RADIUS.lg,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    backgroundColor: UI_COLORS.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  summaryLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  summaryValue: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.bodyStrong,
  },
  listCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    backgroundColor: UI_COLORS.surfaceSoft,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 12,
  },
  listTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.cardTitle,
  },
  listHint: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    lineHeight: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: UI_RADIUS.lg,
    paddingVertical: 10,
  },
  productRowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  productImageWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: UI_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productCopy: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.bodyStrong,
  },
  productMeta: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  productMetaColumn: {
    alignItems: 'flex-end',
    minWidth: 92,
  },
  productPrice: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  productStatusPill: {
    borderRadius: UI_RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  productStatusPillAvailable: {
    backgroundColor: UI_COLORS.successSoft,
  },
  productStatusPillUnavailable: {
    backgroundColor: UI_COLORS.dangerSoft,
  },
  productStatusLabel: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  productStatusLabelAvailable: {
    color: UI_COLORS.successText,
  },
  productStatusLabelUnavailable: {
    color: UI_COLORS.accentRed,
  },
  emptyStateText: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    paddingVertical: 12,
  },
  noteCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    backgroundColor: UI_COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 14,
  },
  noteTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 6,
  },
  noteText: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonStack: {
    marginTop: 18,
    gap: 10,
  },
  primaryButton: {
    marginBottom: 0,
  },
});

export default SmartBasketPreviewSheet;
