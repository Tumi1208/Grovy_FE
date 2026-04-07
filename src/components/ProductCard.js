import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ProductImage from './ProductImage';
import { COLORS } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';

function ProductCard({ imageSource, onPress, product, style }) {
  const stockLabel =
    product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable';

  return (
    <Pressable
      android_ripple={{ color: '#E6F2E9' }}
      onPress={() => onPress(product)}
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && styles.pressedCard,
      ]}
    >
      <View style={styles.imagePanel}>
        <View style={styles.imageGlow} />
        <View style={styles.categoryBadge}>
          <Text numberOfLines={1} style={styles.categoryBadgeLabel}>
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

      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {stockLabel}
        </Text>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          </View>

          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeLabel}>+</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E0E8DA',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#112218',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  pressedCard: {
    opacity: 0.94,
  },
  imagePanel: {
    backgroundColor: '#EEF6E8',
    minHeight: 170,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    position: 'relative',
  },
  imageGlow: {
    position: 'absolute',
    top: -18,
    right: -10,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#D5E8D2',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  categoryBadgeLabel: {
    color: '#48614D',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 23,
    minHeight: 46,
  },
  image: {
    width: '100%',
    height: 110,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  meta: {
    color: '#708076',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: '#7E8C81',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  price: {
    color: COLORS.primaryDark,
    fontSize: 20,
    fontWeight: '800',
  },
  actionBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#D92C20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgeLabel: {
    color: COLORS.surface,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
  },
});

export default ProductCard;
