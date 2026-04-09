import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { CUSTOMER_ACCOUNT_MENU } from '../../data/customerTabsData';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';

const ACCOUNT_COLORS = Object.freeze({
  screen: '#FCF8F3',
  surface: '#FFFFFF',
  border: '#EEE7DF',
  text: '#211A16',
  muted: '#7F7870',
  accent: '#D71920',
  accentPressed: '#C6161C',
  avatar: '#EDE2D6',
});

function getAccountEmail(currentUser) {
  if (!currentUser?.name) {
    return 'demo.customer@grovy.app';
  }

  return `${currentUser.name.trim().toLowerCase().replace(/\s+/g, '.')}@grovy.app`;
}

function MenuRow({ label, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#F2ECE5' }}
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
    >
      <Text style={styles.menuRowLabel}>{label}</Text>
      <Text style={styles.menuRowChevron}>{'>'}</Text>
    </Pressable>
  );
}

function AccountScreen({ navigation }) {
  const { currentUser, signOut } = useApp();
  const { totalItems } = useCart();
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
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
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
            android_ripple={{ color: '#D1383D' }}
            onPress={signOut}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <Text style={styles.logoutButtonLabel}>Log Out</Text>
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
    backgroundColor: ACCOUNT_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: ACCOUNT_COLORS.screen,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 132,
  },
  title: {
    color: ACCOUNT_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 22,
  },
  profileCard: {
    backgroundColor: ACCOUNT_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ACCOUNT_COLORS.border,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: ACCOUNT_COLORS.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLabel: {
    color: ACCOUNT_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    color: ACCOUNT_COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  userEmail: {
    color: ACCOUNT_COLORS.muted,
    fontSize: 14,
  },
  menuCard: {
    backgroundColor: ACCOUNT_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ACCOUNT_COLORS.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  menuRowPressed: {
    opacity: 0.92,
  },
  menuRowLabel: {
    color: ACCOUNT_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  menuRowChevron: {
    color: ACCOUNT_COLORS.muted,
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: ACCOUNT_COLORS.border,
    marginHorizontal: 18,
  },
  logoutButton: {
    backgroundColor: ACCOUNT_COLORS.accent,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  logoutButtonPressed: {
    backgroundColor: ACCOUNT_COLORS.accentPressed,
  },
  logoutButtonLabel: {
    color: ACCOUNT_COLORS.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
  },
});

export default AccountScreen;
