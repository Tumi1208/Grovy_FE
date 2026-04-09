import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductImageSource } from '../../assets/productImages';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import ProductImage from '../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import { useFavourite } from '../../context/FavouriteContext';
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
  const { favourites, removeFromFavourites } = useFavourite();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Favourite</Text>

          {favourites.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No favourites yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the heart on a product card or detail screen to save it here.
              </Text>
              <Pressable
                android_ripple={{ color: '#D1383D' }}
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                ]}
              >
                <Text style={styles.primaryButtonLabel}>Go to Shop</Text>
              </Pressable>
            </View>
          ) : null}

          {favourites.map(product => (
            <View key={product.id} style={styles.row}>
              <Pressable
                android_ripple={{ color: '#F2ECE5' }}
                onPress={() =>
                  navigation.navigate(CUSTOMER_ROUTES.PRODUCT_DETAIL, {
                    productId: product.id,
                    initialProduct: product,
                  })
                }
                style={({ pressed }) => [
                  styles.rowMain,
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

              <Pressable
                android_ripple={{ color: '#F2ECE5' }}
                onPress={() => removeFromFavourites(product.id)}
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed && styles.removeButtonPressed,
                ]}
              >
                <Text style={styles.removeButtonIcon}>♥</Text>
              </Pressable>
            </View>
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
  emptyState: {
    backgroundColor: FAVOURITE_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: FAVOURITE_COLORS.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: FAVOURITE_COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: FAVOURITE_COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    minWidth: 180,
    backgroundColor: FAVOURITE_COLORS.accent,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonLabel: {
    color: FAVOURITE_COLORS.surface,
    fontSize: 17,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FAVOURITE_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FAVOURITE_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
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
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE7E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  removeButtonPressed: {
    opacity: 0.86,
  },
  removeButtonIcon: {
    color: FAVOURITE_COLORS.accent,
    fontSize: 18,
    lineHeight: 18,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
  },
});

export default FavouriteScreen;
