import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { OWNER_ROUTES } from '../../constants/routes';
import { useApp } from '../../context/AppContext';

function OwnerDashboardScreen({ navigation }) {
  const { currentUser, signOut } = useApp();
  const shopName = currentUser?.shopName || 'Your grocery shop';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Owner preview</Text>
        <Text style={styles.title}>{shopName}</Text>
        <Text style={styles.subtitle}>
          Seller screens now live in a separate flow so future auth and
          permission checks can be added with minimal refactoring.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current mock session</Text>
        <Text style={styles.cardText}>
          Signed in as {currentUser?.name || 'Owner'}.
        </Text>
        <Text style={styles.cardText}>
          Product management, shop analytics, and order handling can be built on
          this flow later.
        </Text>
      </View>

      <PrimaryButton
        title="Manage Products"
        onPress={() => navigation.navigate(OWNER_ROUTES.MANAGE_PRODUCTS)}
      />
      <View style={styles.buttonSpacer} />
      <PrimaryButton
        title="Shop Orders"
        onPress={() => navigation.navigate(OWNER_ROUTES.SHOP_ORDERS)}
        variant="secondary"
      />
      <View style={styles.buttonSpacer} />
      <PrimaryButton
        title="Back to Auth Placeholder"
        onPress={signOut}
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
  hero: {
    marginBottom: 20,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    color: COLORS.muted,
    lineHeight: 22,
    marginBottom: 6,
  },
  buttonSpacer: {
    height: 12,
  },
});

export default OwnerDashboardScreen;
