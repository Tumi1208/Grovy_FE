import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { CUSTOMER_ROUTES } from '../../constants/routes';

function OrderSuccessScreen({ navigation, route }) {
  const orderId = route.params?.orderId;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.subtitle}>
          The MVP purchase flow is now connected to the Grovy backend.
        </Text>
        {orderId ? (
          <Text style={styles.orderId}>Order reference: {orderId}</Text>
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
  orderId: {
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginTop: 12,
  },
});

export default OrderSuccessScreen;
