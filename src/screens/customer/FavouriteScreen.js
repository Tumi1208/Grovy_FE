import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductImageSource } from '../../assets/productImages';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import ProductImage from '../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useCart } from '../../context/CartContext';
import { useFavourite } from '../../context/FavouriteContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductSubtitle } from '../../utils/productPresentation';

const EMPTY_FAVOURITE_IMAGE = require('../../assets/images/products/fruit-and-veggie-heart-scaled.png');

function FavouriteScreen({ navigation }) {
  const { addToCart, totalItems } = useCart();
  const { favourites, removeFromFavourites } = useFavourite();

  function handleOpenProduct(product) {
    navigation.navigate(CUSTOMER_ROUTES.PRODUCT_DETAIL, {
      productId: product.id,
      initialProduct: product,
    });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Saved items</Text>
              <Text style={styles.subtitle}>
                Keep your regular groceries close at hand.
              </Text>
            </View>

            <View style={styles.countPill}>
              <Text style={styles.countPillLabel}>{favourites.length}</Text>
            </View>
          </View>

          {favourites.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyImageWrap}>
                <ProductImage
                  name="Saved items"
                  resizeMode="contain"
                  source={EMPTY_FAVOURITE_IMAGE}
                  style={styles.emptyImage}
                />
              </View>
              <Text style={styles.emptyTitle}>No saved items yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the heart on a product to keep it here for later.
              </Text>
              <Pressable
                android_ripple={{ color: '#3D5F39' }}
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                ]}
              >
                <Text style={styles.primaryButtonLabel}>Go to shop</Text>
              </Pressable>
            </View>
          ) : null}

          {favourites.map(product => (
            <View key={product.id} style={styles.row}>
              <Pressable
                android_ripple={{ color: '#EEE7DC' }}
                onPress={() => handleOpenProduct(product)}
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
                  <Text style={styles.price}>{formatCurrency(product.price)}</Text>
                </View>
              </Pressable>

              <View style={styles.actions}>
                <Pressable
                  android_ripple={{ color: '#3D5F39' }}
                  onPress={() => addToCart(product, 1)}
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.addButtonPressed,
                  ]}
                >
                  <Text style={styles.addButtonLabel}>Add</Text>
                </Pressable>

                <Pressable
                  android_ripple={{ color: '#EEE7DC' }}
                  onPress={() => removeFromFavourites(product.id)}
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed && styles.removeButtonPressed,
                  ]}
                >
                  <Text style={styles.removeButtonIcon}>♥</Text>
                </Pressable>
              </View>
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
    backgroundColor: UI_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: UI_COLORS.screen,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: UI_LAYOUT.screenTop,
    paddingBottom: 132,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.screenTitle,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 6,
    maxWidth: '82%',
  },
  countPill: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  countPillLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    ...UI_SHADOWS.card,
  },
  emptyImageWrap: {
    width: 136,
    height: 136,
    borderRadius: 40,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyImage: {
    width: 98,
    height: 98,
  },
  emptyTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    minWidth: 180,
    minHeight: UI_LAYOUT.ctaHeight,
    backgroundColor: UI_COLORS.accentGreen,
    borderRadius: UI_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  primaryButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  primaryButtonLabel: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.buttonLarge,
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
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...UI_SHADOWS.card,
  },
  rowPressed: {
    opacity: 0.96,
  },
  imageWrap: {
    width: 74,
    height: 74,
    borderRadius: 20,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  image: {
    width: 56,
    height: 56,
  },
  copy: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    color: UI_COLORS.textStrong,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  meta: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginBottom: 8,
  },
  price: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  actions: {
    marginLeft: 10,
    alignItems: 'stretch',
  },
  addButton: {
    minWidth: 64,
    height: 42,
    borderRadius: 16,
    backgroundColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  addButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  addButtonLabel: {
    color: UI_COLORS.surface,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  removeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: UI_COLORS.accentRedSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  removeButtonPressed: {
    opacity: 0.84,
  },
  removeButtonIcon: {
    color: UI_COLORS.accentRed,
    fontSize: 16,
    lineHeight: 16,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: UI_LAYOUT.bottomNavSide,
    right: UI_LAYOUT.bottomNavSide,
    bottom: UI_LAYOUT.bottomNavBottom,
  },
});

export default FavouriteScreen;
