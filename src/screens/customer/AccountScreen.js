import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import DirectionalHint from '../../components/DirectionalHint';
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
      <DirectionalHint
        chevronSize={8}
        color={UI_COLORS.mutedStrong}
        mode="plain"
        style={styles.menuRowIndicator}
      />
    </Pressable>
  );
}

function ProfileTag({ label }) {
  return (
    <View style={styles.profileTag}>
      <Text style={styles.profileTagLabel}>{label}</Text>
    </View>
  );
}

function StatCard({ label, style, value }) {
  return (
    <View style={[styles.statCard, style]}>
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
          <Text style={styles.titleEyebrow}>Profile</Text>
          <Text style={styles.title}>Account</Text>
          <Text style={styles.titleSubtitle}>
            Manage your groceries, saved items and delivery preferences.
          </Text>

          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLabel}>{userName.slice(0, 1)}</Text>
              </View>

              <View style={styles.profileCopy}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
              </View>
            </View>

            <View style={styles.profileTagRow}>
              <ProfileTag label="Grovy member" />
              <ProfileTag label="Cash on delivery" />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                label="Items in cart"
                style={styles.profileStatCard}
                value={`${totalItems}`}
              />
              <StatCard
                label="Saved items"
                style={styles.profileStatCard}
                value={`${totalFavourites}`}
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>Preferences</Text>
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
    backgroundColor: UI_COLORS.screenLight,
  },
  screen: {
    flex: 1,
    backgroundColor: UI_COLORS.screenLight,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 132,
  },
  titleEyebrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 4,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.screenTitle,
  },
  titleSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 8,
    marginBottom: 22,
    maxWidth: '92%',
  },
  profileCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 18,
    ...UI_SHADOWS.card,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: UI_COLORS.accentGreenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarLabel: {
    color: UI_COLORS.accentGreen,
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
  profileTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  profileTag: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  profileTagLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  sectionLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  statCard: {
    width: '48%',
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  profileStatCard: {
    width: '48%',
  },
  statValue: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 6,
  },
  statLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  menuCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
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
    paddingVertical: 17,
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
  menuRowIndicator: {
    marginLeft: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: UI_COLORS.border,
    marginHorizontal: 18,
  },
  logoutButton: {
    minHeight: UI_LAYOUT.ctaHeight,
    backgroundColor: '#FFF7F6',
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
