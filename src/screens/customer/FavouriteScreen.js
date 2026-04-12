import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductImageSource } from '../../assets/productImages';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import DirectionalHint from '../../components/DirectionalHint';
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
            <View style={styles.headerCopy}>
              <Text style={styles.headerEyebrow}>Buy again</Text>
              <Text style={styles.title}>Saved items</Text>
              <Text style={styles.subtitle}>
                Keep your regular groceries close at hand.
              </Text>
            </View>

            <View style={styles.countPill}>
              <Text style={styles.countPillValue}>{favourites.length}</Text>
              <Text style={styles.countPillLabel}>saved</Text>
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
            <Pressable
              android_ripple={{ color: '#EEE7DC' }}
              key={product.id}
              onPress={() => handleOpenProduct(product)}
              style={({ pressed }) => [
                styles.rowCard,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.rowTop}>
                <View style={styles.imageWrap}>
                  <ProductImage
                    name={product.name}
                    resizeMode="contain"
                    source={getProductImageSource(product)}
                    style={styles.image}
                  />
                </View>

                <View style={styles.copy}>
                  <View style={styles.rowMetaRow}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillLabel}>
                        {product.category}
                      </Text>
                    </View>
                    <DirectionalHint
                      chevronSize={8}
                      color={UI_COLORS.mutedStrong}
                      mode="plain"
                      style={styles.rowIndicator}
                    />
                  </View>
                  <Text numberOfLines={2} style={styles.name}>
                    {product.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.meta}>
                    {getProductSubtitle(product)}
                  </Text>
                  <Text
                    style={[
                      styles.availability,
                      product.stock > 0
                        ? styles.availabilityInStock
                        : styles.availabilityOutOfStock,
                    ]}
                  >
                    {product.stock > 0
                      ? `${product.stock} available`
                      : 'Unavailable'}
                  </Text>
                </View>
              </View>

              <View style={styles.rowFooter}>
                <View>
                  <Text style={styles.priceLabel}>Price</Text>
                  <Text style={styles.price}>
                    {formatCurrency(product.price)}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    android_ripple={{ color: '#3D5F39' }}
                    onPress={event => {
                      event.stopPropagation();
                      addToCart(product, 1);
                    }}
                    style={({ pressed }) => [
                      styles.addButton,
                      pressed && styles.addButtonPressed,
                    ]}
                  >
                    <Text style={styles.addButtonLabel}>Quick add</Text>
                  </Pressable>

                  <Pressable
                    android_ripple={{ color: '#EEE7DC' }}
                    onPress={event => {
                      event.stopPropagation();
                      removeFromFavourites(product.id);
                    }}
                    style={({ pressed }) => [
                      styles.removeButton,
                      pressed && styles.removeButtonPressed,
                    ]}
                  >
                    <Text style={styles.removeButtonIcon}>♥</Text>
                  </Pressable>
                </View>
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
    backgroundColor: UI_COLORS.screenLight,
  },
  screen: {
    flex: 1,
    backgroundColor: UI_COLORS.screenLight,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 132,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  headerEyebrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 4,
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
    minWidth: 72,
    borderRadius: 24,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...UI_SHADOWS.card,
  },
  countPillValue: {
    color: UI_COLORS.textStrong,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  countPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI_COLORS.accentGreen,
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
  rowCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 17,
    marginBottom: 14,
    ...UI_SHADOWS.card,
  },
  rowPressed: {
    opacity: 0.96,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  image: {
    width: 62,
    height: 62,
  },
  copy: {
    flex: 1,
  },
  rowMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  rowIndicator: {
    marginLeft: 8,
  },
  name: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 4,
  },
  meta: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginBottom: 6,
  },
  availability: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  availabilityInStock: {
    color: UI_COLORS.accentGreen,
  },
  availabilityOutOfStock: {
    color: UI_COLORS.accentRed,
  },
  rowFooter: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 4,
  },
  price: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  actions: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    minWidth: 84,
    height: 38,
    borderRadius: 14,
    backgroundColor: UI_COLORS.accentGreen,
    borderWidth: 1,
    borderColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginRight: 8,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
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
