import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { getProductImageSource } from '../../assets/productImages';
import PrimaryButton from '../../components/PrimaryButton';
import ProductCard from '../../components/ProductCard';
import { COLORS } from '../../constants/colors';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import { getProducts } from '../../services/productService';

function ListSeparator() {
  return <View style={styles.separator} />;
}

function HomeScreenHeader({ totalItems, onOpenCart }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Simple grocery MVP</Text>
      <Text style={styles.subtitle}>
        Browse products from the Grovy backend, inspect item details, and move
        through the checkout flow with the Express API.
      </Text>
      <PrimaryButton
        title={`View Cart (${totalItems})`}
        onPress={onOpenCart}
        variant="secondary"
      />
    </View>
  );
}

function HomeScreenEmptyState({ errorMessage, isLoading, onRetry }) {
  if (isLoading) {
    return <Text style={styles.emptyState}>Loading products from backend...</Text>;
  }

  if (errorMessage) {
    return (
      <View style={styles.emptyWrapper}>
        <Text style={styles.emptyState}>{errorMessage}</Text>
        <PrimaryButton title="Retry" onPress={onRetry} />
      </View>
    );
  }

  return <Text style={styles.emptyState}>No products available yet.</Text>;
}

function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const { totalItems } = useCart();

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
          setProducts(items);
        }
      } catch (error) {
        if (isMounted) {
          setProducts([]);
          setErrorMessage(
            error.message || 'Could not load products from the Grovy backend.',
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

  function handleReloadProducts() {
    setReloadKey(currentValue => currentValue + 1);
  }

  function handleOpenProduct(product) {
    navigation.navigate(CUSTOMER_ROUTES.PRODUCT_DETAIL, {
      productId: product.id,
      initialProduct: product,
    });
  }

  function handleOpenCart() {
    navigation.navigate(CUSTOMER_ROUTES.CART);
  }

  function renderProductItem({ item }) {
    return (
      <ProductCard
        imageSource={getProductImageSource(item)}
        product={item}
        onPress={handleOpenProduct}
      />
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={products}
      ItemSeparatorComponent={ListSeparator}
      keyExtractor={item => item.id}
      ListEmptyComponent={
        <HomeScreenEmptyState
          errorMessage={errorMessage}
          isLoading={isLoading}
          onRetry={handleReloadProducts}
        />
      }
      ListHeaderComponent={
        <HomeScreenHeader totalItems={totalItems} onOpenCart={handleOpenCart} />
      }
      renderItem={renderProductItem}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    color: COLORS.muted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  emptyWrapper: {
    gap: 12,
  },
});

export default HomeScreen;
