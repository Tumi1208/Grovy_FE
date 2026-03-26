import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';

function ProductCard({ product, onPress }) {
  return (
    <Pressable
      onPress={() => onPress(product)}
      style={({ pressed }) => [styles.card, pressed && styles.pressedCard]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
      </View>

      <Text style={styles.meta}>
        {product.category} | {product.stock} in stock
      </Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.link}>View details</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  pressedCard: {
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  price: {
    color: COLORS.primaryDark,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: COLORS.muted,
    marginBottom: 8,
  },
  description: {
    color: COLORS.text,
    lineHeight: 20,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 12,
  },
});

export default ProductCard;
