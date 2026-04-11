import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductImageSource } from '../../assets/productImages';
import ChevronIcon from '../../components/icons/ChevronIcon';
import PrimaryButton from '../../components/PrimaryButton';
import ProductCard from '../../components/ProductCard';
import { CUSTOMER_DEMO_PRODUCTS } from '../../data/customerTabsData';
import { useCart } from '../../context/CartContext';
import { useFavourite } from '../../context/FavouriteContext';
import { getProducts } from '../../services/productService';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { getProductsByCategory } from '../../utils/categoryProducts';

function CategoryProductsScreen({ navigation, route }) {
  const routeCategory = route.params?.category || '';
  const routeTitle = route.params?.title || routeCategory || 'Category';
  const [products, setProducts] = useState(CUSTOMER_DEMO_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const { addToCart } = useCart();
  const { isFavourite, toggleFavourite } = useFavourite();

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      if (isMounted) {
        setIsLoading(true);
        setErrorMessage('');
      }

      try {
        const items = await getProducts();

        if (isMounted) {
          setProducts(items.length > 0 ? items : CUSTOMER_DEMO_PRODUCTS);
        }
      } catch (error) {
        if (isMounted) {
          setProducts(CUSTOMER_DEMO_PRODUCTS);
          setErrorMessage(error.message || 'Could not load this aisle.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const visibleProducts = useMemo(
    () => getProductsByCategory(products, routeCategory),
    [products, routeCategory],
  );

  function handleOpenProduct(product) {
    if (!product?.id) {
      return;
    }

    navigation.navigate(CUSTOMER_ROUTES.PRODUCT_DETAIL, {
      productId: product.id,
      initialProduct: product,
    });
  }

  function handleQuickAddToCart(product) {
    if (!product?.id) {
      return;
    }

    addToCart(product, 1);
  }

  function handleRetry() {
    setReloadKey(currentValue => currentValue + 1);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            android_ripple={{ color: '#EEE6DC' }}
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <ChevronIcon
              color={UI_COLORS.textStrong}
              direction="left"
              size={12}
              strokeWidth={1.9}
            />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={styles.title}>
              {routeTitle}
            </Text>
            <Text style={styles.subtitle}>
              {visibleProducts.length} item
              {visibleProducts.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              Showing the saved assortment while we reconnect.
            </Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={UI_COLORS.accentGreen} size="small" />
            <Text style={styles.stateTitle}>Loading aisle</Text>
            <Text style={styles.stateSubtitle}>
              Getting the latest grocery items ready.
            </Text>
          </View>
        ) : visibleProducts.length === 0 ? (
          <View style={styles.centeredState}>
            <Text style={styles.stateTitle}>No items in this aisle yet</Text>
            <Text style={styles.stateSubtitle}>
              Try another category or refresh the catalog.
            </Text>
            <View style={styles.stateSpacer} />
            <PrimaryButton
              title="Back to explore"
              onPress={() => navigation.goBack()}
              variant="secondary"
            />
            <View style={styles.secondarySpacer} />
            <PrimaryButton title="Retry" onPress={handleRetry} />
          </View>
        ) : (
          <FlatList
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.listContent}
            data={visibleProducts}
            keyExtractor={item => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <ProductCard
                imageSource={getProductImageSource(item)}
                isFavourite={isFavourite(item.id)}
                onAddToCart={handleQuickAddToCart}
                onPress={handleOpenProduct}
                onToggleFavourite={toggleFavourite}
                product={item}
                style={styles.productCardCell}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
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
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    width: UI_LAYOUT.iconButton,
    height: UI_LAYOUT.iconButton,
    borderRadius: UI_RADIUS.lg,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  backButtonPressed: {
    opacity: 0.9,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.sectionTitle,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
  },
  infoBanner: {
    backgroundColor: UI_COLORS.errorSoft,
    borderRadius: UI_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#EBCFC8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  infoBannerText: {
    color: UI_COLORS.accentRed,
    fontSize: 13,
    lineHeight: 20,
  },
  centeredState: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    ...UI_SHADOWS.card,
  },
  stateTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  stateSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    textAlign: 'center',
  },
  stateSpacer: {
    height: 18,
  },
  secondarySpacer: {
    height: 10,
  },
  listContent: {
    paddingBottom: 32,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  productCardCell: {
    width: '48%',
  },
});

export default CategoryProductsScreen;
