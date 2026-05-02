import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DirectionalHint from '../DirectionalHint';
import ProductImage from '../ProductImage';
import {
  UI_COLORS,
  UI_PRESS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductSubtitle } from '../../utils/productPresentation';
import ScalePressable from '../ScalePressable';

function HomeProductCard({
  imageSource,
  onAddToCart,
  onLongPress,
  onPress,
  product,
  style,
}) {
  const longPressTriggeredRef = useRef(false);
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
        <View style={styles.priceBlock}>
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

        <ScalePressable
          android_ripple={{ color: '#3E6540' }}
          disabled={!isAvailable}
          hitSlop={6}
          onPress={event => {
            event.stopPropagation();
            onAddToCart?.(product);
          }}
          pressScale={UI_PRESS.scale.strong}
          style={({ pressed }) => [
            styles.addButton,
            !isAvailable && styles.addButtonDisabled,
            pressed && isAvailable && styles.addButtonPressed,
          ]}
        >
          <Text style={styles.addButtonLabel}>Add</Text>
        </ScalePressable>
      </View>
    </ScalePressable>
  );
}

export function HomeCategoryCard({ category, onPress, style }) {
  return (
    <ScalePressable
      android_ripple={{ color: '#EDE5DB' }}
      onPress={() => onPress?.(category)}
      pressScale={UI_PRESS.scale.subtle}
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
          <DirectionalHint
            chevronSize={8}
            color={UI_COLORS.mutedStrong}
            mode="tinted"
            size={22}
            style={styles.categoryIndicator}
          />
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
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 190,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 16,
    minHeight: 262,
    ...UI_SHADOWS.card,
  },
  cardPressed: {
    opacity: UI_PRESS.opacity.subtle,
  },
  imageWrap: {
    height: 144,
    borderRadius: 24,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    height: 100,
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
    marginTop: 'auto',
  },
  priceBlock: {
    flex: 1,
    paddingRight: 10,
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
    minWidth: 54,
    height: 38,
    borderRadius: 14,
    backgroundColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  addButtonDisabled: {
    backgroundColor: UI_COLORS.surfaceTint,
  },
  addButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
    opacity: UI_PRESS.opacity.soft,
  },
  addButtonLabel: {
    color: UI_COLORS.surface,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
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
    opacity: UI_PRESS.opacity.subtle,
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
    marginTop: 2,
    marginLeft: 8,
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
