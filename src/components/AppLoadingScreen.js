import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../constants/ui';

function AppLoadingScreen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Grovy</Text>
          <Text style={styles.title}>Restoring your account</Text>
          <Text style={styles.subtitle}>
            Loading your saved session and profile details.
          </Text>
          <ActivityIndicator
            color={UI_COLORS.accentGreen}
            size="large"
            style={styles.spinner}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.screenLight,
  },
  screen: {
    flex: 1,
    paddingHorizontal: UI_LAYOUT.screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI_COLORS.screenLight,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 24,
    paddingVertical: 28,
    ...UI_SHADOWS.card,
  },
  eyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.35,
    lineHeight: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.sectionTitle,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 8,
  },
  spinner: {
    marginTop: 24,
  },
});

export default AppLoadingScreen;
