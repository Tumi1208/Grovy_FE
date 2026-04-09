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
import ProductCard from '../../components/ProductCard';
import PrimaryButton from '../../components/PrimaryButton';
import { CUSTOMER_DEMO_PRODUCTS } from '../../data/customerTabsData';
import { useCart } from '../../context/CartContext';
import { useFavourite } from '../../context/FavouriteContext';
import { getProducts } from '../../services/productService';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { getProductsByCategory } from '../../utils/categoryProducts';

const CATEGORY_COLORS = Object.freeze({
  screen: '#FCF8F3',
  surface: '#FFFFFF',
  border: '#EEE7DF',
  text: '#211A16',
  muted: '#7F7870',
  accent: '#D71920',
  shadow: '#2A160B',
});

function BackGlyph() {
  return <Text style={styles.backGlyph}>{'<'}</Text>;
}

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
          setErrorMessage(
            error.message || 'Could not load products for this category.',
          );
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
            android_ripple={{ color: '#F1EBE4' }}
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <BackGlyph />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={styles.title}>
              {routeTitle}
            </Text>
            <Text style={styles.subtitle}>
              {visibleProducts.length} product(s)
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              {errorMessage} Showing the local demo catalog instead.
            </Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={CATEGORY_COLORS.accent} size="small" />
            <Text style={styles.stateTitle}>Loading products...</Text>
            <Text style={styles.stateSubtitle}>
              Preparing the selected category page.
            </Text>
          </View>
        ) : visibleProducts.length === 0 ? (
          <View style={styles.centeredState}>
            <Text style={styles.stateTitle}>No products in this category</Text>
            <Text style={styles.stateSubtitle}>
              This category is available in Explore, but there are no matching
              products in the current catalog yet.
            </Text>
            <View style={styles.stateSpacer} />
            <PrimaryButton
              title="Back to Explore"
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
    backgroundColor: CATEGORY_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: CATEGORY_COLORS.screen,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: CATEGORY_COLORS.surface,
    borderWidth: 1,
    borderColor: CATEGORY_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  backButtonPressed: {
    opacity: 0.9,
  },
  backGlyph: {
    color: CATEGORY_COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: CATEGORY_COLORS.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: CATEGORY_COLORS.muted,
    fontSize: 14,
    marginTop: 4,
  },
  infoBanner: {
    backgroundColor: '#FFF2F2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  infoBannerText: {
    color: CATEGORY_COLORS.accent,
    fontSize: 13,
    lineHeight: 20,
  },
  centeredState: {
    backgroundColor: CATEGORY_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CATEGORY_COLORS.border,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  stateTitle: {
    color: CATEGORY_COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  stateSubtitle: {
    color: CATEGORY_COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  stateSpacer: {
    height: 18,
  },
  secondarySpacer: {
    height: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCardCell: {
    flexBasis: '48%',
    maxWidth: '48%',
  },
});

export default CategoryProductsScreen;
