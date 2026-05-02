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
import DirectionalHint from '../DirectionalHint';
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

function getCollectionTags(collection = {}) {
  if (!Array.isArray(collection?.tags)) {
    return [];
  }

  return collection.tags.filter(Boolean).slice(0, 3);
}

function getAvailabilityMessages(missingCount, unavailableCount) {
  const messages = [];

  if (missingCount > 0) {
    messages.push(
      `${missingCount} configured item${missingCount === 1 ? '' : 's'} could not be matched.`,
    );
  }

  if (unavailableCount > 0) {
    messages.push(
      `${unavailableCount} product${unavailableCount === 1 ? '' : 's'} are out of stock and will be skipped.`,
    );
  }

  return messages;
}

function SummaryCard({ highlight = false, label, value }) {
  return (
    <View style={[styles.summaryCard, highlight && styles.summaryCardHighlight]}>
      <Text
        style={[
          styles.summaryLabel,
          highlight && styles.summaryLabelHighlight,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          highlight && styles.summaryValueHighlight,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function PreviewCluster({ products = [] }) {
  const previewProducts = products.slice(0, 4);
  const remainingCount = Math.max(0, products.length - previewProducts.length);

  if (!previewProducts.length) {
    return (
      <View style={styles.previewFallback}>
        <Text style={styles.previewFallbackLabel}>No matches</Text>
      </View>
    );
  }

  return (
    <View style={styles.previewCluster}>
      {previewProducts.map((product, index) => (
        <View
          key={product.id || `${product.name}-${index}`}
          style={[
            styles.previewBubble,
            index > 0 && styles.previewBubbleOffset,
            { zIndex: previewProducts.length - index },
          ]}
        >
          <ProductImage
            name={product.name}
            resizeMode="contain"
            source={getProductImage(product.imageKey)}
            style={styles.previewBubbleImage}
          />
        </View>
      ))}
      {remainingCount > 0 ? (
        <View style={[styles.previewBubble, styles.previewBubbleOffset, styles.previewCountBubble]}>
          <Text style={styles.previewCountLabel}>+{remainingCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

function BasketProductRow({ onPress, product }) {
  const isAvailable = product?.stock > 0;
  const imageSource = getProductImage(product?.imageKey);
  const canOpenDetails = product?.id && typeof onPress === 'function';

  return (
    <ScalePressable
      android_ripple={{ color: '#EFE6DA' }}
      disabled={!canOpenDetails}
      onPress={() => onPress?.(product)}
      pressScale={0.992}
      style={({ pressed }) => [
        styles.productRow,
        pressed && canOpenDetails && styles.productRowPressed,
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

      <View style={styles.productBody}>
        <View style={styles.productTopRow}>
          <Text numberOfLines={1} style={styles.productCategory}>
            {product?.category || 'Groceries'}
          </Text>
          <Text style={styles.productPrice}>{formatCurrency(product?.price || 0)}</Text>
        </View>

        <Text numberOfLines={2} style={styles.productName}>
          {product?.name || 'Unnamed product'}
        </Text>

        <View style={styles.productBottomRow}>
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

          {canOpenDetails ? (
            <View style={styles.productHintRow}>
              <Text style={styles.productHintLabel}>View details</Text>
              <DirectionalHint
                chevronSize={7}
                color={UI_COLORS.mutedStrong}
                mode="plain"
                size={16}
              />
            </View>
          ) : null}
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
  const collectionTags = getCollectionTags(collection);
  const addableCount =
    Number(collection?.addableCount) ||
    resolvedProducts.filter(product => product?.id && product?.stock > 0).length;
  const missingCount = Number(collection?.missingCount) || 0;
  const unavailableCount =
    Number(collection?.unavailableCount) ||
    resolvedProducts.filter(product => product?.stock <= 0).length;
  const estimatedTotal = getEstimatedTotal(collection, resolvedProducts);
  const availabilityMessages = getAvailabilityMessages(
    missingCount,
    unavailableCount,
  );
  const footerNote =
    availabilityMessages[0] ||
    (addableCount > 0
      ? 'Items will appear in your mini cart right away.'
      : 'Try another basket when more products are available.');

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
      maxHeight: Math.min(height * 0.86, 700),
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            <View style={styles.heroCard}>
              <View pointerEvents="none" style={styles.heroGlowLarge} />
              <View pointerEvents="none" style={styles.heroGlowSmall} />

              <View style={styles.heroTopRow}>
                <View style={styles.heroEyebrowPill}>
                  <Text style={styles.heroEyebrowLabel}>Smart basket preview</Text>
                </View>

                <View style={styles.heroTotalPill}>
                  <Text style={styles.heroTotalCaption}>Estimated total</Text>
                  <Text style={styles.heroTotalValue}>
                    {formatCurrency(estimatedTotal)}
                  </Text>
                </View>
              </View>

              <Text style={styles.title}>{collection.title || 'Smart basket'}</Text>
              {collection.subtitle ? (
                <Text style={styles.subtitle}>{collection.subtitle}</Text>
              ) : null}

              {collectionTags.length ? (
                <View style={styles.tagRow}>
                  {collectionTags.map(tag => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagLabel}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.heroBottomRow}>
                <PreviewCluster products={resolvedProducts} />

                <View style={styles.heroInfoColumn}>
                  <View style={styles.heroReadyPill}>
                    <Text style={styles.heroReadyLabel}>
                      {addableCount} item{addableCount === 1 ? '' : 's'} ready
                    </Text>
                  </View>

                  {typeof onSelectProduct === 'function' ? (
                    <Text style={styles.heroHint}>
                      Tap any product below to jump into details.
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <SummaryCard
                label="Resolved"
                value={`${resolvedProducts.length} item${
                  resolvedProducts.length === 1 ? '' : 's'
                }`}
              />
              <SummaryCard
                label="Available"
                value={`${addableCount} item${addableCount === 1 ? '' : 's'}`}
              />
              <SummaryCard
                highlight
                label="Add now"
                value={formatCurrency(estimatedTotal)}
              />
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionCopy}>
                  <Text style={styles.sectionEyebrow}>Included right now</Text>
                  <Text style={styles.sectionTitle}>Basket contents</Text>
                </View>

                <View style={styles.sectionCountPill}>
                  <Text style={styles.sectionCountLabel}>
                    {resolvedProducts.length}
                  </Text>
                </View>
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
                <View style={styles.emptyStateCard}>
                  <Text style={styles.emptyStateTitle}>Nothing matched yet</Text>
                  <Text style={styles.emptyStateText}>
                    No matching products are available right now.
                  </Text>
                </View>
              )}
            </View>

            {availabilityMessages.length ? (
              <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>Heads up</Text>
                {availabilityMessages.map(message => (
                  <Text key={message} style={styles.noteText}>
                    {message}
                  </Text>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footerCard}>
            <View style={styles.footerTopRow}>
              <View style={styles.footerCopy}>
                <Text style={styles.footerEyebrow}>
                  {addableCount > 0
                    ? `${addableCount} item${addableCount === 1 ? '' : 's'} ready to add`
                    : 'Nothing ready to add'}
                </Text>
                <Text style={styles.footerValue}>
                  {addableCount > 0
                    ? formatCurrency(estimatedTotal)
                    : 'Check back later'}
                </Text>
              </View>

              <View style={styles.footerBadge}>
                <Text style={styles.footerBadgeLabel}>1 tap</Text>
              </View>
            </View>

            <Text style={styles.footerNote}>{footerNote}</Text>

            <PrimaryButton
              disabled={addableCount <= 0}
              onPress={() => onAddAll?.(collection)}
              style={styles.primaryButton}
              title={addableCount > 0 ? 'Add all to cart' : 'No items available'}
            />

            <ScalePressable
              android_ripple={{ color: '#EDE0D0' }}
              onPress={() => handleDismiss()}
              pressScale={0.985}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
            >
              <Text style={styles.closeButtonLabel}>Close</Text>
            </ScalePressable>
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
    backgroundColor: 'rgba(20, 15, 12, 0.58)',
  },
  sheet: {
    backgroundColor: '#FFF9F2',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#E7D6C2',
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: 16,
    overflow: 'hidden',
    ...UI_SHADOWS.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 52,
    height: 5,
    borderRadius: UI_RADIUS.round,
    backgroundColor: '#D4C0A8',
    opacity: 0.72,
    marginBottom: 16,
  },
  scrollView: {
    flexGrow: 0,
    minHeight: 0,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E7D6C2',
    backgroundColor: '#F4E9D8',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  heroGlowLarge: {
    position: 'absolute',
    top: -38,
    right: -18,
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  heroGlowSmall: {
    position: 'absolute',
    bottom: -24,
    left: -14,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(79, 122, 74, 0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroEyebrowPill: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(255, 253, 250, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 250, 0.72)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroEyebrowLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  heroTotalPill: {
    alignItems: 'flex-end',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 253, 250, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  heroTotalCaption: {
    color: UI_COLORS.mutedStrong,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.32,
    marginBottom: 4,
  },
  heroTotalValue: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
    marginTop: 14,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tagChip: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  previewCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    marginRight: 14,
  },
  previewBubble: {
    width: 58,
    height: 58,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.76)',
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  previewBubbleOffset: {
    marginLeft: -12,
  },
  previewBubbleImage: {
    width: '100%',
    height: '100%',
  },
  previewCountBubble: {
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderColor: '#D7E4D2',
  },
  previewCountLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  previewFallback: {
    minWidth: 112,
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  previewFallbackLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  heroInfoColumn: {
    flex: 1,
  },
  heroReadyPill: {
    alignSelf: 'flex-start',
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(79, 122, 74, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 8,
  },
  heroReadyLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  heroHint: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EADBCB',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  summaryCardHighlight: {
    backgroundColor: '#F0F5EB',
    borderColor: '#D9E7D5',
  },
  summaryLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  summaryLabelHighlight: {
    color: UI_COLORS.accentGreen,
  },
  summaryValue: {
    color: UI_COLORS.textStrong,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#EADBCB',
    backgroundColor: '#F7EFE4',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sectionCopy: {
    flex: 1,
  },
  sectionEyebrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 5,
  },
  sectionTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.cardTitle,
  },
  sectionCountPill: {
    minWidth: 36,
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(79, 122, 74, 0.11)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sectionCountLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EEE1D4',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  productRowPressed: {
    backgroundColor: '#FFF7EE',
    borderColor: '#E9D5C0',
  },
  productImageWrap: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#FFF3E4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productBody: {
    flex: 1,
  },
  productTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 5,
  },
  productCategory: {
    flex: 1,
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.32,
  },
  productPrice: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  productName: {
    color: UI_COLORS.textStrong,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  productBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  productStatusPill: {
    borderRadius: UI_RADIUS.round,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  productStatusPillAvailable: {
    backgroundColor: UI_COLORS.successSoft,
  },
  productStatusPillUnavailable: {
    backgroundColor: UI_COLORS.dangerSoft,
  },
  productStatusLabel: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  productStatusLabelAvailable: {
    color: UI_COLORS.successText,
  },
  productStatusLabelUnavailable: {
    color: UI_COLORS.accentRed,
  },
  productHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productHintLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginRight: 4,
  },
  emptyStateCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EEE1D4',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  emptyStateTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.bodyStrong,
    marginBottom: 4,
  },
  emptyStateText: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  noteCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EADBCB',
    backgroundColor: '#FFF4EA',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 14,
  },
  noteTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 6,
  },
  noteText: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  footerCard: {
    borderTopWidth: 1,
    borderTopColor: '#E8D7C4',
    paddingTop: 14,
    marginTop: 8,
  },
  footerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerCopy: {
    flex: 1,
  },
  footerEyebrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.32,
    marginBottom: 4,
  },
  footerValue: {
    color: UI_COLORS.textStrong,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  footerBadge: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: '#F2E6D8',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  footerBadgeLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  footerNote: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 8,
    marginBottom: 14,
  },
  primaryButton: {
    marginBottom: 0,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    marginTop: 10,
    borderRadius: UI_RADIUS.xl,
    backgroundColor: '#F3E7D9',
    borderWidth: 1,
    borderColor: '#E6D5C2',
  },
  closeButtonPressed: {
    opacity: 0.88,
  },
  closeButtonLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
});

export default SmartBasketPreviewSheet;
