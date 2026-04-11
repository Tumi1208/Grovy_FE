import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { UI_COLORS } from '../constants/ui';

function ProductImage({ name, resizeMode = 'cover', source, style }) {
  if (source) {
    return (
      <Image
        accessibilityLabel={name ? `${name} image` : 'Product image'}
        resizeMode={resizeMode}
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
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: UI_COLORS.surfaceMuted,
    borderRadius: 16,
    justifyContent: 'center',
  },
  placeholderText: {
    color: UI_COLORS.accentGreen,
    fontSize: 24,
    fontWeight: '700',
  },
});

export default ProductImage;
