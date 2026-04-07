import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { useCart } from '../../context/CartContext';

const PLACEHOLDER_CONTENT = Object.freeze({
  [CUSTOMER_ROUTES.EXPLORE]: {
    title: 'Find Products',
    subtitle:
      'Explore tab placeholder. This screen is separated from Home so the colorful category-block style can be built here later without leaking into Home.',
  },
  [CUSTOMER_ROUTES.FAVOURITE]: {
    title: 'Favourite',
    subtitle:
      'Favourite tab placeholder. Navigation is wired so the bottom nav can move here correctly.',
  },
  [CUSTOMER_ROUTES.ACCOUNT]: {
    title: 'Account',
    subtitle:
      'Account tab placeholder. This keeps the bottom nav flow working before the full screen is implemented.',
  },
});

function PlaceholderTabScreen({ navigation, route }) {
  const { totalItems } = useCart();
  const content = PLACEHOLDER_CONTENT[route.name] || {
    title: 'Coming Soon',
    subtitle: 'This screen is not implemented yet.',
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>
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
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
  },
});

export default PlaceholderTabScreen;
