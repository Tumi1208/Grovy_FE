import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { OWNER_ROUTES } from '../../constants/routes';

function ShopOrdersScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Shop orders placeholder</Text>
        <Text style={styles.subtitle}>
          Future seller order management belongs in this isolated owner flow,
          separate from the customer checkout MVP.
        </Text>
      </View>

      <PrimaryButton
        title="Back to Dashboard"
        onPress={() => navigation.navigate(OWNER_ROUTES.DASHBOARD)}
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
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.muted,
    lineHeight: 22,
  },
});

export default ShopOrdersScreen;
