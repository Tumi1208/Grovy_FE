import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';

const PLACEHOLDER_CONTENT = Object.freeze({
  [CUSTOMER_ROUTES.EXPLORE]: {
    title: 'Explore',
    subtitle:
      'This tab is wired correctly for demo. The full Explore layout can be added in a later step without affecting the main shopping flow.',
    ctaLabel: 'Back to Shop',
  },
  [CUSTOMER_ROUTES.FAVOURITE]: {
    title: 'Favourite',
    subtitle:
      'Favourite is still a placeholder, but the bottom navigation state and route are already working correctly.',
    ctaLabel: 'Go to Shop',
  },
  [CUSTOMER_ROUTES.ACCOUNT]: {
    title: 'Account',
    subtitle:
      'Account is kept simple for now so the customer demo flow stays stable and easy to present.',
    ctaLabel: 'Continue Shopping',
  },
});

function PlaceholderTabScreen({ navigation, route }) {
  const { totalItems } = useCart();
  const content = PLACEHOLDER_CONTENT[route.name] || {
    title: 'Coming Soon',
    subtitle: 'This screen is not implemented yet.',
    ctaLabel: 'Back to Shop',
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>Placeholder</Text>
            </View>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.subtitle}>{content.subtitle}</Text>
            <Pressable
              android_ripple={{ color: '#D1383D' }}
              onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonLabel}>{content.ctaLabel}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomNavWrap}>
          <CustomerBottomNav
            activeRoute={route.name}
            navigation={navigation}
            totalItems={totalItems}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF7F2',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FBF7F2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 96,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#EEE7DF',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  pill: {
    alignSelf: 'center',
    backgroundColor: '#F7F2EB',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 18,
  },
  pillLabel: {
    color: '#7F7870',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  title: {
    color: '#211A16',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#7F7870',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#D71920',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
  },
});

export default PlaceholderTabScreen;
