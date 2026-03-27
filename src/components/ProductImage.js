import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

function ProductImage({ name, source, style }) {
  if (source) {
    return (
      <Image
        accessibilityLabel={name ? `${name} image` : 'Product image'}
        resizeMode="cover"
        source={source}
        style={[styles.image, style]}
      />
    );
  }

  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.placeholderText}>
        {name ? name.slice(0, 1).toUpperCase() : 'G'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.primaryDark,
    fontSize: 24,
    fontWeight: '700',
  },
});

export default ProductImage;
