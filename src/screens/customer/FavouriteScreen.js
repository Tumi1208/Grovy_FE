import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductImageSource } from '../../assets/productImages';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import ProductImage from '../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  CUSTOMER_DEMO_PRODUCTS,
  FAVOURITE_PRODUCT_IDS,
} from '../../data/customerTabsData';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductSubtitle } from '../../utils/productPresentation';

const FAVOURITE_COLORS = Object.freeze({
  screen: '#FCF8F3',
  surface: '#FFFFFF',
  border: '#EEE7DF',
  text: '#211A16',
  muted: '#7F7870',
  accent: '#D71920',
});

function FavouriteScreen({ navigation }) {
  const { totalItems } = useCart();
  const favouriteProducts = useMemo(
    () =>
      CUSTOMER_DEMO_PRODUCTS.filter(product =>
        FAVOURITE_PRODUCT_IDS.includes(product.id),
      ),
    [],
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Favourite</Text>

          {favouriteProducts.map(product => (
            <Pressable
              key={product.id}
              android_ripple={{ color: '#F2ECE5' }}
              onPress={() =>
                navigation.navigate(CUSTOMER_ROUTES.PRODUCT_DETAIL, {
                  productId: product.id,
                  initialProduct: product,
                })
              }
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.imageWrap}>
                <ProductImage
                  name={product.name}
                  resizeMode="contain"
                  source={getProductImageSource(product)}
                  style={styles.image}
                />
              </View>

              <View style={styles.copy}>
                <Text numberOfLines={1} style={styles.name}>
                  {product.name}
                </Text>
                <Text numberOfLines={1} style={styles.meta}>
                  {getProductSubtitle(product)}
                </Text>
              </View>

              <View style={styles.priceWrap}>
                <Text style={styles.price}>{formatCurrency(product.price)}</Text>
                <Text style={styles.chevron}>{'>'}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.bottomNavWrap}>
          <CustomerBottomNav
            activeRoute={CUSTOMER_ROUTES.FAVOURITE}
            navigation={navigation}
            totalItems={totalItems}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FAVOURITE_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: FAVOURITE_COLORS.screen,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 132,
  },
  title: {
    color: FAVOURITE_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FAVOURITE_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FAVOURITE_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  rowPressed: {
    opacity: 0.94,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#F7F2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  image: {
    width: 54,
    height: 54,
    backgroundColor: 'transparent',
  },
  copy: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    color: FAVOURITE_COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: FAVOURITE_COLORS.muted,
    fontSize: 14,
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  price: {
    color: FAVOURITE_COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  chevron: {
    color: FAVOURITE_COLORS.muted,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
  },
});

export default FavouriteScreen;
