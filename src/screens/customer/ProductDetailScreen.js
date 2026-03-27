import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getProductImageSource } from '../../assets/productImages';
import PrimaryButton from '../../components/PrimaryButton';
import ProductImage from '../../components/ProductImage';
import { COLORS } from '../../constants/colors';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';
import { getProductById } from '../../services/productService';
import { formatCurrency } from '../../utils/formatCurrency';

function ProductDetailScreen({ navigation, route }) {
  // Render the tapped product immediately, then refresh it from the API.
  const initialProduct = route.params?.initialProduct || null;
  const productId = route.params?.productId || initialProduct?.id || null;
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const { addToCart, totalItems } = useCart();

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      if (!productId) {
        if (isMounted) {
          setProduct(initialProduct);
          setErrorMessage('No product was selected.');
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setProduct(initialProduct);
        setErrorMessage('');
        setIsLoading(true);
      }

      try {
        const item = await getProductById(productId);

        if (isMounted) {
          setProduct(item);
          setErrorMessage('');
        }
      } catch (error) {
        if (isMounted) {
          setProduct(initialProduct);
          setErrorMessage(error.message || 'Could not load this product.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [initialProduct, productId, reloadKey]);

  function handleRetry() {
    setReloadKey(currentValue => currentValue + 1);
  }

  if (isLoading && !product) {
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
        <PrimaryButton title="Retry" onPress={handleRetry} />
        <View style={styles.buttonSpacer} />
        <PrimaryButton
          title="Back to Home"
          onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
          variant="secondary"
        />
      </View>
    );
  }

  const imageSource = getProductImageSource(product);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {isLoading ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Refreshing this product from the backend...
          </Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {errorMessage} Showing the product selected from the backend list.
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <ProductImage name={product.name} source={imageSource} style={styles.image} />
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
    paddingBottom: 24,
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
  image: {
    height: 220,
    marginBottom: 20,
    width: '100%',
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
  infoBox: {
    backgroundColor: '#EDFDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    color: COLORS.primaryDark,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    lineHeight: 22,
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
