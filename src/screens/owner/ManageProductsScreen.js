import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { OWNER_ROUTES } from '../../constants/routes';

function ManageProductsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Manage products placeholder</Text>
        <Text style={styles.subtitle}>
          Future owner work can add create, edit, stock, and pricing tools here
          without touching the customer shopping screens.
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

export default ManageProductsScreen;
