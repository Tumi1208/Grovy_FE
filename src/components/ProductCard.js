import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ProductImage from './ProductImage';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_SPACING,
  UI_TYPOGRAPHY,
} from '../constants/ui';
import { getProductImage } from '../constants/productImages';
import { formatCurrency } from '../utils/formatCurrency';
import { getProductSubtitle } from '../utils/productPresentation';

function ProductCard({
  isFavourite = false,
  onAddToCart,
  onPress,
  onToggleFavourite,
  product,
  style,
}) {
  const imageSource = getProductImage(product?.imageKey);
  const subtitle = getProductSubtitle(product);
  const isAvailable = product?.stock > 0;

  return (
    <Pressable
      android_ripple={{ color: '#F2ECE4' }}
      onPress={() => onPress(product)}
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

        <Pressable
          android_ripple={{ color: '#F0E6DE' }}
          hitSlop={6}
          onPress={event => {
            event.stopPropagation();
            onToggleFavourite?.(product);
          }}
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
        </Pressable>

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

        <Text
          style={[
            styles.availability,
            isAvailable ? styles.availabilityInStock : styles.availabilityOut,
          ]}
        >
          {isAvailable ? `${product.stock} available` : 'Out of stock'}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>

          <Pressable
            android_ripple={{ color: '#3C6240' }}
            disabled={!isAvailable}
            hitSlop={6}
            onPress={event => {
              event.stopPropagation();
              onAddToCart?.(product);
            }}
            style={({ pressed }) => [
              styles.actionBadge,
              !isAvailable && styles.actionBadgeDisabled,
              pressed && isAvailable && styles.actionBadgePressed,
            ]}
          >
            <Text style={styles.actionBadgeLabel}>+</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 15,
    minHeight: 252,
    ...UI_SHADOWS.card,
  },
  pressedCard: {
    opacity: 0.96,
  },
  imagePanel: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingTop: 36,
    paddingBottom: 18,
    minHeight: 142,
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
    opacity: 0.88,
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
    height: 104,
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
  },
  availability: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 10,
  },
  availabilityInStock: {
    color: UI_COLORS.accentGreen,
  },
  availabilityOut: {
    color: UI_COLORS.accentRed,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  price: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.price,
  },
  actionBadge: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgeDisabled: {
    backgroundColor: UI_COLORS.surfaceTint,
  },
  actionBadgePressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  actionBadgeLabel: {
    color: UI_COLORS.surface,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: -1,
  },
});

export default ProductCard;
