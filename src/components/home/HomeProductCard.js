import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ProductImage from '../ProductImage';
import ChevronIcon from '../icons/ChevronIcon';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductSubtitle } from '../../utils/productPresentation';

function HomeProductCard({
  imageSource,
  onAddToCart,
  onPress,
  product,
  style,
}) {
  const subtitle = getProductSubtitle(product);
  const isAvailable = product?.stock > 0;

  return (
    <Pressable
      android_ripple={{ color: '#F2ECE4' }}
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <View style={styles.categoryPill}>
          <Text numberOfLines={1} style={styles.categoryPillLabel}>
            {product.category}
          </Text>
        </View>
        <ProductImage
          name={product.name}
          resizeMode="contain"
          source={imageSource}
          style={styles.image}
        />
      </View>

      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>

      <Text numberOfLines={1} style={styles.meta}>
        {subtitle}
      </Text>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <Text
            style={[
              styles.stockLabel,
              isAvailable ? styles.stockLabelActive : styles.stockLabelMuted,
            ]}
          >
            {isAvailable ? `${product.stock} in stock` : 'Out of stock'}
          </Text>
        </View>

        <Pressable
          android_ripple={{ color: '#3E6540' }}
          disabled={!isAvailable}
          hitSlop={6}
          onPress={event => {
            event.stopPropagation();
            onAddToCart?.(product);
          }}
          style={({ pressed }) => [
            styles.addButton,
            !isAvailable && styles.addButtonDisabled,
            pressed && isAvailable && styles.addButtonPressed,
          ]}
        >
          <Text style={styles.addButtonLabel}>+</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export function HomeCategoryCard({ category, onPress, style }) {
  return (
    <Pressable
      android_ripple={{ color: '#EDE5DB' }}
      onPress={() => onPress?.(category)}
      style={({ pressed }) => [
        styles.categoryCard,
        {
          backgroundColor: category.backgroundColor,
          borderColor: category.borderColor,
        },
        style,
        pressed && styles.categoryCardPressed,
      ]}
    >
      <View style={styles.categoryCopy}>
        <View style={styles.categoryTitleRow}>
          <Text numberOfLines={2} style={styles.categoryTitle}>
            {category.title}
          </Text>
          <View style={styles.categoryIndicator}>
            <ChevronIcon color={UI_COLORS.mutedStrong} size={10} />
          </View>
        </View>
        {category.description ? (
          <Text numberOfLines={2} style={styles.categoryDescription}>
            {category.description}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.categoryImageWrap,
          { backgroundColor: category.accentColor },
        ]}
      >
        <ProductImage
          name={category.title}
          resizeMode="contain"
          source={category.imageSource}
          style={styles.categoryImage}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 190,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 15,
    minHeight: 248,
    ...UI_SHADOWS.card,
  },
  cardPressed: {
    opacity: 0.96,
  },
  imageWrap: {
    height: 136,
    borderRadius: 22,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
    position: 'relative',
    paddingTop: 26,
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  image: {
    width: '100%',
    height: 96,
  },
  name: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.cardTitle,
    minHeight: 44,
  },
  meta: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
    minHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  price: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.price,
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 4,
  },
  stockLabelActive: {
    color: UI_COLORS.accentGreen,
  },
  stockLabelMuted: {
    color: UI_COLORS.accentRed,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: UI_COLORS.surfaceTint,
  },
  addButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  addButtonLabel: {
    color: UI_COLORS.surface,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: -1,
  },
  categoryCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    minHeight: 138,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...UI_SHADOWS.card,
  },
  categoryCardPressed: {
    opacity: 0.95,
  },
  categoryCopy: {
    flex: 1,
    paddingRight: 18,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  categoryTitle: {
    flex: 1,
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    paddingRight: 12,
  },
  categoryIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.38)',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDescription: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  categoryImageWrap: {
    width: 78,
    height: 78,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: 60,
    height: 60,
  },
});

export default HomeProductCard;
