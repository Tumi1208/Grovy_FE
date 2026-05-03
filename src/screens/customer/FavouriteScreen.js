import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import FavouriteItemRow from '../../components/favourites/FavouriteItemRow';
import ProductImage from '../../components/ProductImage';
import PrimaryButton from '../../components/PrimaryButton';
import ScalePressable from '../../components/ScalePressable';
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

const EMPTY_FAVOURITE_IMAGE = require('../../assets/images/products/fruit-and-veggie-heart-scaled.png');
const FEEDBACK_HIDE_DELAY_MS = 1500;
const UNDO_HIDE_DELAY_MS = 4000;

if (
  Platform.OS === 'android' &&
  typeof UIManager.setLayoutAnimationEnabledExperimental === 'function'
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function configureFavouriteRemovalLayout() {
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

function FavouriteScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { addToFavourites, favourites, removeFromFavourites } = useFavourite();
  const [openItemId, setOpenItemId] = useState(null);
  const [feedbackState, setFeedbackState] = useState({
    message: '',
    actionLabel: '',
    tone: 'success',
  });
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackTranslateY = useRef(new Animated.Value(10)).current;
  const feedbackTimeoutRef = useRef(null);
  const feedbackActionRef = useRef(null);
  const savedCountLabel = `${favourites.length} item${
    favourites.length === 1 ? '' : 's'
  }`;

  const clearFeedbackTimer = useCallback(() => {
    if (!feedbackTimeoutRef.current) {
      return;
    }

    clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = null;
  }, []);

  const hideFeedback = useCallback(() => {
    clearFeedbackTimer();
    feedbackActionRef.current = null;

    feedbackOpacity.stopAnimation();
    feedbackTranslateY.stopAnimation();

    Animated.parallel([
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(feedbackTranslateY, {
        toValue: 10,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setFeedbackState({
          message: '',
          actionLabel: '',
          tone: 'success',
        });
      }
    });
  }, [clearFeedbackTimer, feedbackOpacity, feedbackTranslateY]);

  const showFeedback = useCallback(
    (
      message,
      {
        actionLabel = '',
        durationMs = FEEDBACK_HIDE_DELAY_MS,
        onAction = null,
        tone = 'success',
      } = {},
    ) => {
      clearFeedbackTimer();
      feedbackActionRef.current =
        typeof onAction === 'function' ? onAction : null;
      setFeedbackState({
        message,
        actionLabel,
        tone,
      });

      feedbackOpacity.stopAnimation();
      feedbackTranslateY.stopAnimation();

      Animated.parallel([
        Animated.timing(feedbackOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(feedbackTranslateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      feedbackTimeoutRef.current = setTimeout(() => {
        feedbackTimeoutRef.current = null;
        hideFeedback();
      }, durationMs);
    },
    [clearFeedbackTimer, feedbackOpacity, feedbackTranslateY, hideFeedback],
  );

  const handleFeedbackAction = useCallback(() => {
    const action = feedbackActionRef.current;

    feedbackActionRef.current = null;
    hideFeedback();
    action?.();
  }, [hideFeedback]);

  useEffect(() => {
    return () => {
      clearFeedbackTimer();
      feedbackActionRef.current = null;
      feedbackOpacity.stopAnimation();
      feedbackTranslateY.stopAnimation();
    };
  }, [clearFeedbackTimer, feedbackOpacity, feedbackTranslateY]);

  useEffect(() => {
    if (!openItemId) {
      return;
    }

    const itemStillExists = favourites.some(item => item.id === openItemId);

    if (!itemStillExists) {
      setOpenItemId(null);
    }
  }, [favourites, openItemId]);

  const handleOpenItem = useCallback(productId => {
    setOpenItemId(productId);
  }, []);

  const handleCloseItem = useCallback(productId => {
    setOpenItemId(currentItemId =>
      currentItemId === productId ? null : currentItemId,
    );
  }, []);

  const handleAddSavedItemToCart = useCallback(
    product => {
      setOpenItemId(currentItemId =>
        currentItemId === product.id ? null : currentItemId,
      );
      addToCart(product, 1);
      showFeedback(`${product.name} added to cart`);
    },
    [addToCart, showFeedback],
  );

  const handleRemoveSavedItem = useCallback(
    productId => {
      const removedProduct = favourites.find(item => item.id === productId);

      if (!removedProduct) {
        return;
      }

      configureFavouriteRemovalLayout();
      setOpenItemId(currentItemId =>
        currentItemId === productId ? null : currentItemId,
      );
      removeFromFavourites(productId);

      showFeedback(`${removedProduct.name} removed from saved items`, {
        actionLabel: 'Undo',
        durationMs: UNDO_HIDE_DELAY_MS,
        onAction: () => {
          configureFavouriteRemovalLayout();
          addToFavourites(removedProduct);
        },
        tone: 'destructive',
      });
    },
    [addToFavourites, favourites, removeFromFavourites, showFeedback],
  );

  const feedbackAnimatedStyle = {
    opacity: feedbackOpacity,
    transform: [{ translateY: feedbackTranslateY }],
  };

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
          onScrollBeginDrag={() => setOpenItemId(null)}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerCard}>
              <View style={styles.headerTopRow}>
                <View style={styles.headerCopy}>
                  <Text style={styles.headerEyebrow}>Buy again</Text>
                  <Text style={styles.title}>Saved for later</Text>
                  <Text style={styles.subtitle}>
                    Keep your regular groceries close at hand.
                  </Text>
                </View>

                <View style={styles.countPill}>
                  <Text style={styles.countPillLabel}>Saved</Text>
                  <Text style={styles.countPillValue}>{favourites.length}</Text>
                  <Text style={styles.countPillMeta}>items</Text>
                </View>
              </View>

              <View style={styles.headerMetaRow}>
                <View style={[styles.headerMetaCard, styles.headerMetaCardSpaced]}>
                  <Text style={styles.headerMetaLabel}>Ready to buy again</Text>
                  <Text style={styles.headerMetaValue}>{savedCountLabel}</Text>
                </View>

                <View style={styles.headerMetaCard}>
                  <Text style={styles.headerMetaLabel}>Quick actions</Text>
                  <Text style={styles.headerMetaValue}>
                    Swipe left to add, right to remove
                  </Text>
                </View>
              </View>
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
              <Text style={styles.emptyEyebrow}>Saved staples</Text>
              <Text style={styles.emptyTitle}>No saved groceries yet</Text>
              <Text style={styles.emptySubtitle}>
                Save regular items so you can buy them again quickly.
              </Text>
              <View style={styles.emptyHintPill}>
                <Text style={styles.emptyHintPillLabel}>
                  Start with Explore and keep your regular picks here
                </Text>
              </View>
              <PrimaryButton
                onPress={() => navigation.navigate(CUSTOMER_ROUTES.EXPLORE)}
                style={styles.emptyPrimaryButton}
                title="Explore products"
              />
            </View>
          ) : null}

          {favourites.map(product => (
            <FavouriteItemRow
              isOpen={openItemId === product.id}
              key={product.id}
              onAddToCart={handleAddSavedItemToCart}
              onClose={handleCloseItem}
              onOpen={handleOpenItem}
              onPress={handleOpenProduct}
              onRemove={handleRemoveSavedItem}
              product={product}
            />
          ))}
        </ScrollView>

        {feedbackState.message ? (
          <Animated.View
            pointerEvents={feedbackState.actionLabel ? 'box-none' : 'none'}
            style={[
              styles.feedbackToastContainer,
              { bottom: insets.bottom + 164 },
              feedbackAnimatedStyle,
            ]}
            testID="favourite-feedback-toast"
          >
            <View
              style={[
                styles.feedbackToast,
                feedbackState.tone === 'destructive'
                  ? styles.feedbackToastDestructive
                  : styles.feedbackToastSuccess,
                feedbackState.actionLabel
                  ? styles.feedbackToastWithAction
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.feedbackToastLabel,
                  feedbackState.tone === 'destructive'
                    ? styles.feedbackToastLabelDefault
                    : styles.feedbackToastLabelSuccess,
                ]}
              >
                {feedbackState.message}
              </Text>

              {feedbackState.actionLabel ? (
                <ScalePressable
                  android_ripple={{ color: '#9D2B2B' }}
                  onPress={handleFeedbackAction}
                  pressScale={0.96}
                  style={({ pressed }) => [
                    styles.feedbackActionButton,
                    pressed && styles.feedbackActionButtonPressed,
                  ]}
                  testID="favourite-feedback-toast-action"
                >
                  <Text style={styles.feedbackActionButtonLabel}>
                    {feedbackState.actionLabel}
                  </Text>
                </ScalePressable>
              ) : null}
            </View>
          </Animated.View>
        ) : null}
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
    paddingBottom: UI_LAYOUT.bottomNavContentInset + 48,
  },
  header: {
    marginBottom: 20,
  },
  headerCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    ...UI_SHADOWS.card,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
    letterSpacing: 0.4,
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
  },
  headerMetaRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  headerMetaCard: {
    flex: 1,
    borderRadius: UI_RADIUS.xl,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerMetaCardSpaced: {
    marginRight: 10,
  },
  headerMetaLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  headerMetaValue: {
    color: UI_COLORS.textStrong,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  countPill: {
    minWidth: 86,
    borderRadius: 24,
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderWidth: 1,
    borderColor: '#D6E4D2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  countPillValue: {
    color: UI_COLORS.accentGreen,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  countPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.32,
    marginBottom: 4,
  },
  countPillMeta: {
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
  emptyEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.38,
    marginBottom: 8,
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
    marginBottom: 14,
  },
  emptyHintPill: {
    borderRadius: UI_RADIUS.pill,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
  },
  emptyHintPillLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  emptyPrimaryButton: {
    width: '100%',
    maxWidth: 240,
  },
  feedbackToastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 40,
    elevation: 10,
  },
  feedbackToast: {
    maxWidth: '84%',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    ...UI_SHADOWS.card,
  },
  feedbackToastSuccess: {
    backgroundColor: UI_COLORS.successSoft,
    borderColor: UI_COLORS.accentGreenSoft,
  },
  feedbackToastDestructive: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.accentRedSoft,
  },
  feedbackToastWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 270,
  },
  feedbackToastLabel: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  feedbackToastLabelSuccess: {
    color: UI_COLORS.successText,
  },
  feedbackToastLabelDefault: {
    color: UI_COLORS.textStrong,
    flex: 1,
    marginRight: 14,
  },
  feedbackActionButton: {
    minWidth: 74,
    backgroundColor: UI_COLORS.accentRed,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI_COLORS.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feedbackActionButtonPressed: {
    backgroundColor: UI_COLORS.accentRedPressed,
  },
  feedbackActionButtonLabel: {
    color: UI_COLORS.surface,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
});

export default FavouriteScreen;
