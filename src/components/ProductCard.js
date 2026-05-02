import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ProductImage from './ProductImage';
import {
  UI_COLORS,
  UI_PRESS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_SPACING,
  UI_TYPOGRAPHY,
} from '../constants/ui';
import { getProductImage } from '../constants/productImages';
import { formatCurrency } from '../utils/formatCurrency';
import { getProductSubtitle } from '../utils/productPresentation';
import ScalePressable from './ScalePressable';

function ProductCard({
  isFavourite = false,
  onAddToCart,
  onLongPress,
  onPress,
  onToggleFavourite,
  product,
  style,
}) {
  const longPressTriggeredRef = useRef(false);
  const imageSource = getProductImage(product?.imageKey);
  const subtitle = getProductSubtitle(product);
  const isAvailable = product?.stock > 0;

  function handleCardPress() {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    onPress?.(product);
  }

  function handleCardLongPress() {
    longPressTriggeredRef.current = true;
    onLongPress?.(product);
  }

  return (
    <ScalePressable
      android_ripple={{ color: '#F2ECE4' }}
      delayLongPress={260}
      onLongPress={handleCardLongPress}
      onPress={handleCardPress}
      pressScale={UI_PRESS.scale.subtle}
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && styles.pressedCard,
      ]}
    >
      <View style={styles.imagePanel}>
        <View style={styles.categoryPill}>
          <Text numberOfLines={1} style={styles.categoryPillLabel}>
            {product.category}
          </Text>
        </View>

        <ScalePressable
          android_ripple={{ color: '#F0E6DE' }}
          hitSlop={6}
          onPress={event => {
            event.stopPropagation();
            onToggleFavourite?.(product);
          }}
          pressScale={UI_PRESS.scale.strong}
          style={({ pressed }) => [
            styles.favouriteButton,
            isFavourite && styles.favouriteButtonActive,
            pressed && styles.favouriteButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.favouriteIcon,
              isFavourite && styles.favouriteIconActive,
            ]}
          >
            {isFavourite ? '♥' : '♡'}
          </Text>
        </ScalePressable>

        <ProductImage
          name={product.name}
          resizeMode="contain"
          source={imageSource}
          style={styles.image}
        />
      </View>

      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>

        <Text numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.priceBlock}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            <Text
              style={[
                styles.stockText,
                isAvailable ? styles.stockTextActive : styles.stockTextMuted,
              ]}
            >
              {isAvailable ? `${product.stock} in stock` : 'Out of stock'}
            </Text>
          </View>

          <ScalePressable
            android_ripple={{ color: '#3C6240' }}
            disabled={!isAvailable}
            hitSlop={6}
            onPress={event => {
              event.stopPropagation();
              onAddToCart?.(product);
            }}
            pressScale={UI_PRESS.scale.strong}
            style={({ pressed }) => [
              styles.actionBadge,
              !isAvailable && styles.actionBadgeDisabled,
              pressed && isAvailable && styles.actionBadgePressed,
            ]}
          >
            <Text style={styles.actionBadgeLabel}>Add</Text>
          </ScalePressable>
        </View>
      </View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 16,
    minHeight: 268,
    ...UI_SHADOWS.card,
  },
  pressedCard: {
    opacity: UI_PRESS.opacity.subtle,
  },
  imagePanel: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingTop: 36,
    paddingBottom: 18,
    minHeight: 148,
    position: 'relative',
  },
  categoryPill: {
    position: 'absolute',
    top: UI_SPACING.sm,
    left: UI_SPACING.sm,
    maxWidth: '56%',
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  favouriteButton: {
    position: 'absolute',
    top: UI_SPACING.sm,
    right: UI_SPACING.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  favouriteButtonActive: {
    backgroundColor: UI_COLORS.accentRedSoft,
  },
  favouriteButtonPressed: {
    opacity: UI_PRESS.opacity.medium,
  },
  favouriteIcon: {
    color: UI_COLORS.muted,
    fontSize: 15,
    lineHeight: 15,
  },
  favouriteIconActive: {
    color: UI_COLORS.accentRed,
  },
  image: {
    width: '100%',
    height: 108,
  },
  body: {
    flex: 1,
    paddingTop: 14,
    justifyContent: 'space-between',
  },
  name: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.cardTitle,
    minHeight: 44,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  priceBlock: {
    flex: 1,
    paddingRight: 10,
  },
  price: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.price,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 4,
  },
  stockTextActive: {
    color: UI_COLORS.accentGreen,
  },
  stockTextMuted: {
    color: UI_COLORS.accentRed,
  },
  actionBadge: {
    minWidth: 54,
    height: 38,
    borderRadius: 14,
    backgroundColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionBadgeDisabled: {
    backgroundColor: UI_COLORS.surfaceTint,
  },
  actionBadgePressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
    opacity: UI_PRESS.opacity.soft,
  },
  actionBadgeLabel: {
    color: UI_COLORS.surface,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
});

export default ProductCard;
