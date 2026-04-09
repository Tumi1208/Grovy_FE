import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../../utils/formatCurrency';

function HomeProductCard({
  imageSource,
  onAddToCart,
  onPress,
  product,
  style,
}) {
  return (
    <Pressable
      android_ripple={{ color: '#F2ECE4' }}
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [styles.card, style, pressed && styles.cardPressed]}
    >
      <View style={styles.imageWrap}>
        <Image resizeMode="contain" source={imageSource} style={styles.image} />
      </View>

      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>

      <Text numberOfLines={1} style={styles.meta}>
        {product.description}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>

        <Pressable
          android_ripple={{ color: '#3E8F5B' }}
          hitSlop={6}
          onPress={event => {
            event.stopPropagation();
            onAddToCart?.(product);
          }}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Text style={styles.addButtonLabel}>+</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export function HomeCategoryCard({ category, style }) {
  return (
    <View
      style={[
        styles.categoryCard,
        { backgroundColor: category.backgroundColor },
        style,
      ]}
    >
      <Text style={styles.categoryTitle}>{category.title}</Text>
      <View
        style={[
          styles.categoryImageWrap,
          { backgroundColor: category.accentColor },
        ]}
      >
        <Image
          resizeMode="contain"
          source={category.imageSource}
          style={styles.categoryImage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 174,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
  },
  cardPressed: {
    opacity: 0.92,
  },
  imageWrap: {
    height: 98,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  image: {
    width: 90,
    height: 90,
  },
  name: {
    color: '#181725',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    minHeight: 40,
  },
  meta: {
    color: '#7C7C7C',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: '#181725',
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#53B175',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    opacity: 0.9,
  },
  addButtonLabel: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 28,
    marginTop: -1,
  },
  categoryCard: {
    width: 248,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTitle: {
    flex: 1,
    color: '#181725',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    paddingRight: 12,
  },
  categoryImageWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: 66,
    height: 66,
  },
});

export default HomeProductCard;
