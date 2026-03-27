import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { formatCurrency } from '../../utils/formatCurrency';

function OrderSuccessScreen({ navigation, route }) {
  const order = route.params?.order;
  const itemCount = Array.isArray(order?.items)
    ? order.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.subtitle}>
          The MVP purchase flow is now connected to the Grovy backend.
        </Text>

        {order?.id ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>Order reference: {order.id}</Text>
            <Text style={styles.summaryText}>Status: {order.status}</Text>
            <Text style={styles.summaryText}>Items: {itemCount}</Text>
            <Text style={styles.summaryText}>
              Total: {formatCurrency(order.totalAmount || 0)}
            </Text>
            <Text style={styles.summaryText}>
              Deliver to: {order.customerName}
            </Text>
            <Text style={styles.summaryText}>{order.address}</Text>
          </View>
        ) : null}
      </View>

      <PrimaryButton
        title="Back to Home"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: CUSTOMER_ROUTES.HOME }],
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    marginBottom: 20,
  },
  title: {
    color: COLORS.success,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.text,
    lineHeight: 22,
  },
  summaryBox: {
    marginTop: 16,
  },
  summaryText: {
    color: COLORS.primaryDark,
    fontWeight: '600',
    lineHeight: 22,
  },
});

export default OrderSuccessScreen;
