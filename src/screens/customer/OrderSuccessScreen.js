import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useAccountData } from '../../context/AccountDataContext';
import { formatOrderDate } from '../../utils/accountFormatting';
import { formatCurrency } from '../../utils/formatCurrency';

const SUCCESS_COLORS = Object.freeze({
  screen: '#FCF8F3',
  surface: '#FFFFFF',
  border: '#EFE7DE',
  text: '#181725',
  muted: '#7C7C7C',
  accent: '#E53935',
  accentPressed: '#CF2E2A',
  success: '#4B7A2A',
  successSoft: '#EEF8EF',
  shadow: '#1C130B',
});

function OrderSuccessScreen({ navigation, route }) {
  const { getOrderById } = useAccountData();
  const orderId = route.params?.orderId || '';
  const order = getOrderById(orderId);
  const itemCount = Array.isArray(order?.items)
    ? order.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  function handleTrackOrder() {
    if (!orderId) {
      navigation.reset({
        index: 1,
        routes: [
          { name: CUSTOMER_ROUTES.ACCOUNT },
          { name: CUSTOMER_ROUTES.ACCOUNT_ORDERS },
        ],
      });
      return;
    }

    navigation.reset({
      index: 2,
      routes: [
        { name: CUSTOMER_ROUTES.ACCOUNT },
        { name: CUSTOMER_ROUTES.ACCOUNT_ORDERS },
        {
          name: CUSTOMER_ROUTES.ORDER_DETAIL,
          params: { orderId },
        },
      ],
    });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.illustrationWrap}>
          <View style={styles.illustrationCircleOuter}>
            <View style={styles.illustrationCircleInner}>
              <Text style={styles.checkGlyph}>✓</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Your Order has been accepted</Text>
        <Text style={styles.subtitle}>
          Your items have been placed and are getting ready for delivery.
        </Text>

        {order?.id ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>Order reference: {order.id}</Text>
            <Text style={styles.summaryText}>
              Total: {formatCurrency(order.totalAmount || 0)}
            </Text>
            <Text style={styles.summaryText}>Items: {itemCount}</Text>
            <Text style={styles.summaryText}>
              Status: {order.status || 'accepted'}
            </Text>
            <Text style={styles.summaryText}>
              Placed: {formatOrderDate(order.createdAt)}
            </Text>
            <Text style={styles.summaryText}>Saved to: Current account</Text>
          </View>
        ) : null}

        <Pressable
          android_ripple={{ color: '#F1EBE3' }}
          onPress={handleTrackOrder}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonLabel}>
            {orderId ? 'Track order' : 'View orders'}
          </Text>
        </Pressable>

        <Pressable
          android_ripple={{ color: '#D1383D' }}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: CUSTOMER_ROUTES.HOME }],
            })
          }
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonLabel}>Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SUCCESS_COLORS.screen,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: SUCCESS_COLORS.screen,
  },
  illustrationWrap: {
    marginBottom: 28,
  },
  illustrationCircleOuter: {
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: SUCCESS_COLORS.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCircleInner: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: SUCCESS_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SUCCESS_COLORS.border,
  },
  checkGlyph: {
    color: SUCCESS_COLORS.success,
    fontSize: 48,
    fontWeight: '800',
  },
  title: {
    color: SUCCESS_COLORS.text,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: SUCCESS_COLORS.muted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: SUCCESS_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SUCCESS_COLORS.border,
    padding: 20,
    marginBottom: 18,
  },
  summaryText: {
    color: SUCCESS_COLORS.text,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 4,
  },
  summaryHint: {
    color: SUCCESS_COLORS.muted,
    lineHeight: 20,
    marginTop: 8,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: SUCCESS_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SUCCESS_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginBottom: 14,
  },
  secondaryButtonPressed: {
    opacity: 0.86,
  },
  secondaryButtonLabel: {
    color: SUCCESS_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: SUCCESS_COLORS.accent,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    shadowColor: SUCCESS_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  primaryButtonPressed: {
    backgroundColor: SUCCESS_COLORS.accentPressed,
  },
  primaryButtonLabel: {
    color: SUCCESS_COLORS.surface,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OrderSuccessScreen;
