import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { defaultProductImage } from '../../assets/productImages';
import ProductImage from '../../components/ProductImage';
import ScalePressable from '../../components/ScalePressable';
import CartHealthCard from '../../components/cart/CartHealthCard';
import CartItemRow from '../../components/cart/CartItemRow';
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
if (
  Platform.OS === 'android' &&
  typeof UIManager.setLayoutAnimationEnabledExperimental === 'function'
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function configureCartRemovalLayout() {
  LayoutAnimation.configureNext({
    duration: 220,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

function CartScreen({ navigation }) {
  const {
    decreaseQuantity,
    increaseQuantity,
    items,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();
  const { addToFavourites, isFavourite } = useFavourite();
  const [openItemId, setOpenItemId] = useState(null);

  const hasItems = items.length > 0;

  useEffect(() => {
    if (!openItemId) {
      return;
    }

    const itemStillExists = items.some(item => item.product.id === openItemId);

    if (!itemStillExists) {
      setOpenItemId(null);
    }
  }, [items, openItemId]);

  const handleOpenItem = useCallback(productId => {
    setOpenItemId(productId);
  }, []);

  const handleCloseItem = useCallback(productId => {
    setOpenItemId(currentItemId =>
      currentItemId === productId ? null : currentItemId,
    );
  }, []);

  const handleRemoveItem = useCallback(
    productId => {
      configureCartRemovalLayout();
      setOpenItemId(currentItemId =>
        currentItemId === productId ? null : currentItemId,
      );
      removeFromCart(productId);
    },
    [removeFromCart],
  );

  const handleSaveForLater = useCallback(
    product => {
      if (isFavourite(product.id)) {
        Alert.alert(
          'Already saved',
          `${product.name} is already in your saved items.`,
        );
        return;
      }

      addToFavourites(product);
      Alert.alert(
        'Saved for later',
        `${product.name} was added to your saved items.`,
      );
    },
    [addToFavourites, isFavourite],
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>Grovy assistant</Text>
            <Text style={styles.headerTitle}>Ready to checkout</Text>
            <Text style={styles.headerSubtitle}>
              Review your basket before checkout.
            </Text>
          </View>

          <View style={styles.headerPill}>
            <Text style={styles.headerPillValue}>{totalItems}</Text>
            <Text style={styles.headerPillLabel}>
              item{totalItems === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {hasItems ? (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              onScrollBeginDrag={() => setOpenItemId(null)}
              showsVerticalScrollIndicator={false}
            >
              <CartHealthCard items={items} />

              {items.map(item => (
                <CartItemRow
                  isOpen={openItemId === item.product.id}
                  item={item}
                  key={item.product.id}
                  onClose={handleCloseItem}
                  onDecrease={decreaseQuantity}
                  onIncrease={increaseQuantity}
                  onOpen={handleOpenItem}
                  onRemove={handleRemoveItem}
                  onSaveForLater={handleSaveForLater}
                />
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.footerSummary}>
                <Text style={styles.footerSummaryLabel}>Subtotal</Text>
                <Text style={styles.footerSummaryValue}>
                  {formatCurrency(subtotal)}
                </Text>
                <Text style={styles.footerSummaryNote}>
                  Delivery, payment, and final order review on the next step
                </Text>
              </View>

              <ScalePressable
                android_ripple={{ color: '#3D5F39' }}
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.CHECKOUT)}
                pressScale={0.985}
                style={({ pressed }) => [
                  styles.checkoutButton,
                  pressed && styles.checkoutButtonPressed,
                ]}
              >
                <Text style={styles.checkoutButtonLabel}>
                  Continue to checkout
                </Text>
              </ScalePressable>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCard}>
              <View style={styles.emptyImageWrap}>
                <ProductImage
                  name="Empty cart"
                  resizeMode="contain"
                  source={defaultProductImage}
                  style={styles.emptyImage}
                />
              </View>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add a few groceries to start building your order.
              </Text>
              <Text style={styles.emptyHint}>
                Smart baskets, budget picks, and recipe bundles will show up
                here once you add them.
              </Text>
              <ScalePressable
                android_ripple={{ color: '#3D5F39' }}
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
                pressScale={0.985}
                style={({ pressed }) => [
                  styles.emptyStateButton,
                  pressed && styles.emptyStateButtonPressed,
                ]}
              >
                <Text style={styles.emptyStateButtonLabel}>
                  Continue shopping
                </Text>
              </ScalePressable>
            </View>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  headerEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.42,
    marginBottom: 4,
  },
  headerTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.screenTitle,
  },
  headerSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  headerPill: {
    minWidth: 72,
    borderRadius: 24,
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderWidth: 1,
    borderColor: '#D6E4D2',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 6,
    alignItems: 'center',
    ...UI_SHADOWS.card,
  },
  headerPillValue: {
    color: UI_COLORS.accentGreen,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  headerPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 2,
    paddingBottom: 214,
  },
  footer: {
    position: 'absolute',
    left: UI_LAYOUT.footerSide,
    right: UI_LAYOUT.footerSide,
    bottom: 92,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    ...UI_SHADOWS.floating,
  },
  footerSummary: {
    flex: 1,
    paddingHorizontal: 12,
    paddingRight: 10,
  },
  footerSummaryLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 4,
  },
  footerSummaryValue: {
    color: UI_COLORS.textStrong,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  footerSummaryNote: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    maxWidth: 172,
  },
  checkoutButton: {
    minHeight: UI_LAYOUT.ctaHeight,
    minWidth: 176,
    backgroundColor: UI_COLORS.accentGreen,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  checkoutButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  checkoutButtonLabel: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.buttonLarge,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingBottom: 132,
  },
  emptyCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 24,
    alignItems: 'center',
    ...UI_SHADOWS.card,
  },
  emptyImageWrap: {
    width: 116,
    height: 116,
    borderRadius: 32,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyImage: {
    width: 84,
    height: 84,
  },
  emptyTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    color: UI_COLORS.successText,
    ...UI_TYPOGRAPHY.meta,
    marginBottom: 22,
    textAlign: 'center',
  },
  emptyStateButton: {
    minWidth: 220,
    minHeight: UI_LAYOUT.ctaHeight,
    backgroundColor: UI_COLORS.accentGreen,
    borderRadius: UI_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  emptyStateButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
  },
  emptyStateButtonLabel: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.buttonLarge,
    textAlign: 'center',
  },
});

export default CartScreen;
