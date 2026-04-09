import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ProductImage from './ProductImage';
import { formatCurrency } from '../utils/formatCurrency';
import { getProductSubtitle } from '../utils/productPresentation';

function ProductCard({
  imageSource,
  isFavourite = false,
  onAddToCart,
  onPress,
  onToggleFavourite,
  product,
  style,
}) {
  const subtitle = getProductSubtitle(product);

  return (
    <Pressable
      android_ripple={{ color: '#F1EBE4' }}
      onPress={() => onPress(product)}
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && styles.pressedCard,
      ]}
    >
      <View style={styles.imagePanel}>
        <Pressable
          android_ripple={{ color: '#EFE7DF' }}
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

        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>

          <Pressable
            android_ripple={{ color: '#C31B22' }}
            hitSlop={6}
            onPress={event => {
              event.stopPropagation();
              onAddToCart?.(product);
            }}
            style={({ pressed }) => [
              styles.actionBadge,
              pressed && styles.actionBadgePressed,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EEE7DF',
    padding: 12,
    minHeight: 228,
    shadowColor: '#2A160B',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  pressedCard: {
    opacity: 0.94,
  },
  imagePanel: {
    backgroundColor: '#F8F5F1',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    minHeight: 120,
    position: 'relative',
  },
  favouriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  favouriteButtonActive: {
    backgroundColor: '#FFE7E6',
  },
  favouriteButtonPressed: {
    opacity: 0.88,
  },
  favouriteIcon: {
    color: '#8A8178',
    fontSize: 16,
    lineHeight: 16,
  },
  favouriteIconActive: {
    color: '#D71920',
  },
  image: {
    width: '100%',
    height: 96,
    backgroundColor: 'transparent',
  },
  body: {
    flex: 1,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  name: {
    color: '#211A16',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    minHeight: 42,
  },
  subtitle: {
    color: '#8A8178',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  price: {
    color: '#1E1815',
    fontSize: 19,
    fontWeight: '800',
  },
  actionBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#D71920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgePressed: {
    opacity: 0.9,
  },
  actionBadgeLabel: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
    marginTop: -1,
  },
});

export default ProductCard;
