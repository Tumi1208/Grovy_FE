import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ProductImage from './ProductImage';
import { formatCurrency } from '../utils/formatCurrency';

const CATEGORY_VARIANT_MAP = Object.freeze({
  beverages: '1 bottle',
  dairyandeggs: '1 tray',
  fruits: '1 kg',
  meat: '1 pack',
  pantry: '1 pack',
  vegetables: '1 kg',
});

function normalizeLookupKey(value) {
  return typeof value === 'string' && value.trim()
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
    : '';
}

function extractVariantFromText(value = '') {
  const match = value.match(
    /(\d+\s?(?:kg|g|mg|l|ml|pcs?|pieces?|pack|packs|bottle|bottles))/i,
  );

  return match ? match[1] : '';
}

function getProductSubtitle(product = {}) {
  const variantFromName = extractVariantFromText(product.name);

  if (variantFromName) {
    return variantFromName;
  }

  if (/bunch/i.test(product.name)) {
    return '1 bunch';
  }

  if (/root/i.test(product.name)) {
    return '1 root';
  }

  if (/can/i.test(product.name)) {
    return '1 can';
  }

  if (/juice/i.test(product.name)) {
    return '1 bottle';
  }

  return CATEGORY_VARIANT_MAP[normalizeLookupKey(product.category)] || '1 pc';
}

function ProductCard({ imageSource, onPress, product, style }) {
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
  actionBadgeLabel: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
    marginTop: -1,
  },
});

export default ProductCard;
