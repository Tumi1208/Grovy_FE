import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { ROLES } from '../../constants/roles';
import { useApp } from '../../context/AppContext';

function AuthLandingScreen() {
  const { continueAsRole } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Future auth flow</Text>
        <Text style={styles.title}>
          Login and registration are intentionally postponed.
        </Text>
        <Text style={styles.subtitle}>
          This screen keeps an auth entry point in the app structure without
          adding JWT, token storage, or backend auth APIs yet.
        </Text>
      </View>

      <PrimaryButton
        title="Continue as Customer Preview"
        onPress={() => continueAsRole(ROLES.CUSTOMER)}
      />
      <View style={styles.buttonSpacer} />
      <PrimaryButton
        title="Continue as Owner Preview"
        onPress={() => continueAsRole(ROLES.OWNER)}
        variant="secondary"
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
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.muted,
    lineHeight: 22,
  },
  buttonSpacer: {
    height: 12,
  },
});

export default AuthLandingScreen;
