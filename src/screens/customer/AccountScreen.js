import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { CUSTOMER_ACCOUNT_MENU } from '../../data/customerTabsData';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import { useFavourite } from '../../context/FavouriteContext';

function getAccountEmail(currentUser) {
  if (!currentUser?.name) {
    return 'demo.customer@grovy.app';
  }

  return `${currentUser.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')}@grovy.app`;
}

function MenuRow({ label, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#EEE7DC' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        pressed && styles.menuRowPressed,
      ]}
    >
      <Text style={styles.menuRowLabel}>{label}</Text>
      <Text style={styles.menuRowChevron}>{'>'}</Text>
    </Pressable>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AccountScreen({ navigation }) {
  const { currentUser, signOut } = useApp();
  const { totalItems } = useCart();
  const { totalFavourites } = useFavourite();
  const userName = currentUser?.name || 'Demo Customer';
  const userEmail = getAccountEmail(currentUser);

  function handleMenuPress() {}

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Account</Text>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{userName.slice(0, 1)}</Text>
            </View>

            <View style={styles.profileCopy}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Items in cart"
              value={`${totalItems}`}
            />
            <StatCard
              label="Saved items"
              value={`${totalFavourites}`}
            />
          </View>

          <View style={styles.menuCard}>
            {CUSTOMER_ACCOUNT_MENU.map((label, index) => (
              <View key={label}>
                <MenuRow label={label} onPress={handleMenuPress} />
                {index < CUSTOMER_ACCOUNT_MENU.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            ))}
          </View>

          <Pressable
            android_ripple={{ color: '#F0E1DC' }}
            onPress={signOut}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <Text style={styles.logoutButtonLabel}>Log out</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomNavWrap}>
          <CustomerBottomNav
            activeRoute={CUSTOMER_ROUTES.ACCOUNT}
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
    backgroundColor: UI_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: UI_COLORS.screen,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: UI_LAYOUT.screenTop,
    paddingBottom: 132,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.screenTitle,
    marginBottom: 22,
  },
  profileCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 28,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
  },
  userName: {
    color: UI_COLORS.textStrong,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 26,
  },
  userEmail: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingVertical: 18,
    paddingHorizontal: 16,
    ...UI_SHADOWS.card,
  },
  statValue: {
    color: UI_COLORS.textStrong,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 6,
  },
  statLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  menuCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    overflow: 'hidden',
    marginBottom: 18,
    ...UI_SHADOWS.card,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  menuRowPressed: {
    opacity: 0.94,
  },
  menuRowLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  menuRowChevron: {
    color: UI_COLORS.mutedStrong,
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: UI_COLORS.border,
    marginHorizontal: 18,
  },
  logoutButton: {
    minHeight: UI_LAYOUT.ctaHeight,
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E7CFC7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  logoutButtonPressed: {
    opacity: 0.86,
  },
  logoutButtonLabel: {
    color: UI_COLORS.accentRed,
    ...UI_TYPOGRAPHY.buttonLarge,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: UI_LAYOUT.bottomNavSide,
    right: UI_LAYOUT.bottomNavSide,
    bottom: UI_LAYOUT.bottomNavBottom,
  },
});

export default AccountScreen;
