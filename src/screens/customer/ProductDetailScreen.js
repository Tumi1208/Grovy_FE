import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import { getProductById } from '../../services/productService';
import { formatCurrency } from '../../utils/formatCurrency';

function ProductDetailScreen({ navigation, route }) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { addToCart, totalItems } = useCart();
  const productId = route.params?.productId;

  useEffect(() => {
    let isMounted = true;

    if (!productId) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    getProductById(productId)
      .then(item => {
        if (isMounted) {
          setProduct(item);
          setErrorMessage('');
        }
      })
      .catch(error => {
        if (isMounted) {
          setProduct(null);
          setErrorMessage(error.message || 'Could not load this product.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Loading product...</Text>
        <Text style={styles.emptySubtitle}>
          Preparing the selected item details.
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>
          {errorMessage ? 'Could not load product.' : 'Product not found.'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {errorMessage ||
            'The selected product could not be loaded from the backend.'}
        </Text>
        <View style={styles.buttonSpacer} />
        <PrimaryButton
          title="Back to Home"
          onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <Text style={styles.stock}>In stock: {product.stock}</Text>
        <Text style={styles.description}>{product.description}</Text>
      </View>

      <Text style={styles.caption}>Items currently in cart: {totalItems}</Text>

      <PrimaryButton title="Add to Cart" onPress={() => addToCart(product)} />
      <View style={styles.buttonSpacer} />
      <PrimaryButton
        title="Go to Cart"
        onPress={() => navigation.navigate(CUSTOMER_ROUTES.CART)}
        variant="secondary"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 20,
  },
  category: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  name: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  price: {
    color: COLORS.primaryDark,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  description: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
  },
  stock: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: 16,
  },
  caption: {
    color: COLORS.muted,
    marginBottom: 16,
  },
  buttonSpacer: {
    height: 12,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.muted,
    textAlign: 'center',
  },
});

export default ProductDetailScreen;
