import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DirectionalHint from '../../components/DirectionalHint';
import ScalePressable from '../../components/ScalePressable';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useAccountData } from '../../context/AccountDataContext';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import {
  buildAddressFullText,
  formatPaymentMethodMeta,
  formatPaymentMethodShortLabel,
} from '../../utils/accountFormatting';
import { getUserInitials } from '../../utils/userProfile';

const ACCOUNT_MENU_ROUTES = Object.freeze({
  'Edit Profile': CUSTOMER_ROUTES.PROFILE_MANAGEMENT,
  Orders: CUSTOMER_ROUTES.ACCOUNT_ORDERS,
  'Delivery Address': CUSTOMER_ROUTES.DELIVERY_ADDRESSES,
  'Payment Methods': CUSTOMER_ROUTES.PAYMENT_METHODS,
  Notifications: CUSTOMER_ROUTES.NOTIFICATION_SETTINGS,
  Help: CUSTOMER_ROUTES.HELP_SUPPORT,
  About: CUSTOMER_ROUTES.ABOUT_GROVY,
});

const ACCOUNT_MENU_GROUPS = Object.freeze([
  {
    id: 'profile',
    title: 'Profile',
    items: ['Edit Profile', 'Notifications'],
  },
  {
    id: 'shopping',
    title: 'Shopping',
    items: ['Orders', 'Delivery Address', 'Payment Methods'],
  },
  {
    id: 'support',
    title: 'Support',
    items: ['Help', 'About'],
  },
]);

const ACCOUNT_MENU_PRESENTATION = Object.freeze({
  'Edit Profile': {
    monogram: 'EP',
    tone: {
      backgroundColor: '#E8F1E3',
      borderColor: '#D6E6D0',
      textColor: UI_COLORS.accentGreen,
    },
  },
  Orders: {
    monogram: 'OR',
    tone: {
      backgroundColor: '#F8E8DA',
      borderColor: '#EECFB5',
      textColor: '#B16E37',
    },
  },
  'Delivery Address': {
    monogram: 'DA',
    tone: {
      backgroundColor: '#F3EBE1',
      borderColor: '#E6D7C6',
      textColor: '#87654A',
    },
  },
  'Payment Methods': {
    monogram: 'PM',
    tone: {
      backgroundColor: '#ECEFF5',
      borderColor: '#D9DFEA',
      textColor: '#62708B',
    },
  },
  Notifications: {
    monogram: 'NO',
    tone: {
      backgroundColor: '#F8E8E3',
      borderColor: '#EBCFC8',
      textColor: '#AA6552',
    },
  },
  Help: {
    monogram: 'HE',
    tone: {
      backgroundColor: '#F8EFD8',
      borderColor: '#ECDFB7',
      textColor: '#A27A2D',
    },
  },
  About: {
    monogram: 'AB',
    tone: {
      backgroundColor: '#EDF3E8',
      borderColor: '#D8E3CE',
      textColor: '#5E7B4A',
    },
  },
});

function formatCountLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getEnabledNotificationsCount(notificationSettings) {
  return Object.values(notificationSettings || {}).filter(Boolean).length;
}

function getMenuMeta(label, {
  addresses,
  defaultAddress,
  defaultPaymentMethod,
  notificationSettings,
  orders,
  ordersLoading,
  paymentMethods,
  userEmail,
  userPhone,
}) {
  switch (label) {
    case 'Edit Profile':
      return userPhone || userEmail;
    case 'Orders':
      if (ordersLoading) {
        return 'Syncing recent orders';
      }

      return orders.length
        ? `${formatCountLabel(orders.length, 'order', 'orders')} on account`
        : 'No orders saved yet';
    case 'Delivery Address':
      return defaultAddress
        ? `${defaultAddress.label} default · ${formatCountLabel(addresses.length, 'address', 'addresses')}`
        : 'Add your first delivery spot';
    case 'Payment Methods':
      return defaultPaymentMethod
        ? `${formatCountLabel(paymentMethods.length, 'method', 'methods')} · ${formatPaymentMethodShortLabel(defaultPaymentMethod)}`
        : 'Choose a checkout method';
    case 'Notifications': {
      const totalChannels = Object.keys(notificationSettings || {}).length;
      const enabledChannels = getEnabledNotificationsCount(notificationSettings);

      return `${enabledChannels}/${totalChannels} alerts enabled`;
    }
    case 'Help':
      return 'Support and help center';
    case 'About':
      return 'App info and policies';
    default:
      return '';
  }
}

function MenuRow({ label, meta, onPress }) {
  const presentation = ACCOUNT_MENU_PRESENTATION[label];

  return (
    <ScalePressable
      android_ripple={{ color: '#F1E5D7' }}
      contentStyle={styles.menuRowFrame}
      onPress={onPress}
      pressScale={0.985}
      style={({ pressed }) => [
        styles.menuRowPressable,
        pressed && styles.menuRowPressed,
      ]}
    >
      <View style={styles.menuRowContent}>
        <View
          style={[
            styles.menuMonogram,
            {
              backgroundColor: presentation.tone.backgroundColor,
              borderColor: presentation.tone.borderColor,
            },
          ]}
        >
          <Text
            style={[
              styles.menuMonogramLabel,
              { color: presentation.tone.textColor },
            ]}
          >
            {presentation.monogram}
          </Text>
        </View>

        <View style={styles.menuRowCopy}>
          <Text style={styles.menuRowLabel}>{label}</Text>
          {meta ? (
            <View style={styles.menuMetaChip}>
              <Text numberOfLines={1} style={styles.menuMetaChipLabel}>
                {meta}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.menuRowIndicatorWrap}>
        <DirectionalHint
          chevronSize={8}
          color={UI_COLORS.mutedStrong}
          mode="plain"
          style={styles.menuRowIndicator}
        />
      </View>
    </ScalePressable>
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

function PreferenceCard({ detail, label, value }) {
  return (
    <View style={styles.preferenceCard}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.preferenceValue}>
        {value}
      </Text>
      {detail ? (
        <Text numberOfLines={2} style={styles.preferenceDetail}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

function SettingsGroup({ items, menuContext, onPress, title }) {
  return (
    <View style={styles.menuGroupCard}>
      <View style={styles.menuGroupHeader}>
        <Text style={styles.menuGroupTitle}>{title}</Text>
      </View>

      {items.map((label, index) => (
        <View key={label}>
          <MenuRow
            label={label}
            meta={getMenuMeta(label, menuContext)}
            onPress={() => onPress(label)}
          />
          {index < items.length - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </View>
  );
}

function AccountScreen({ navigation }) {
  const { currentUser, signOut } = useApp();
  const { totalItems } = useCart();
  const {
    addresses,
    defaultAddress,
    defaultPaymentMethod,
    notificationSettings,
    orders,
    ordersLoading,
    paymentMethods,
  } = useAccountData();
  const userName =
    currentUser?.displayName || currentUser?.name || 'Grovy Member';
  const userEmail = currentUser?.email || 'youraccount@grovy.app';
  const userPhone = currentUser?.phone || '';
  const avatarUrl = currentUser?.avatarUrl || '';
  const defaultAddressText =
    buildAddressFullText(defaultAddress) || 'Add a delivery address';
  const profileTags = [
    'Grovy member',
    formatPaymentMethodShortLabel(defaultPaymentMethod),
    defaultAddress ? `Default: ${defaultAddress.label}` : '',
  ].filter(Boolean);
  const menuContext = {
    addresses,
    defaultAddress,
    defaultPaymentMethod,
    notificationSettings,
    orders,
    ordersLoading,
    paymentMethods,
    userEmail,
    userPhone,
  };

  function handleMenuPress(label) {
    const routeName = ACCOUNT_MENU_ROUTES[label];

    if (!routeName) {
      return;
    }

    navigation.navigate(routeName);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View pointerEvents="none" style={styles.backgroundGlowPrimary} />
        <View pointerEvents="none" style={styles.backgroundGlowSecondary} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titleEyebrow}>Shopping profile</Text>
          <Text style={styles.title}>Account</Text>
          <Text style={styles.titleSubtitle}>
            Manage your profile, delivery details, and smart shopping
            preferences.
          </Text>

          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarLabel}>
                    {getUserInitials(userName)}
                  </Text>
                </View>
              )}

              <View style={styles.profileCopy}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
                {userPhone ? (
                  <Text style={styles.userMeta}>{userPhone}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.profileTagRow}>
              {profileTags.map(label => (
                <ProfileTag key={label} label={label} />
              ))}
            </View>

            <View style={styles.statsRow}>
              <StatCard
                label="Items in cart"
                style={styles.profileStatCard}
                value={`${totalItems}`}
              />
              <StatCard
                label="Orders"
                style={styles.profileStatCard}
                value={`${orders.length}`}
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>Quick preferences</Text>
          <View style={styles.preferencesRow}>
            <PreferenceCard
              detail={
                defaultAddress?.label ||
                'Set a default address in Account settings.'
              }
              label="Default address"
              value={defaultAddressText}
            />
            <PreferenceCard
              detail={formatPaymentMethodMeta(defaultPaymentMethod)}
              label="Payment"
              value={formatPaymentMethodShortLabel(defaultPaymentMethod)}
            />
          </View>

          <Text style={styles.sectionLabel}>Settings</Text>

          {ACCOUNT_MENU_GROUPS.map(group => (
            <SettingsGroup
              key={group.id}
              items={group.items}
              menuContext={menuContext}
              onPress={handleMenuPress}
              title={group.title}
            />
          ))}

          <ScalePressable
            android_ripple={{ color: '#F0E1DC' }}
            onPress={signOut}
            pressScale={0.985}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <Text style={styles.logoutButtonLabel}>Log out</Text>
          </ScalePressable>
        </ScrollView>
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
  backgroundGlowPrimary: {
    position: 'absolute',
    top: 18,
    right: -58,
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: '#F2E5D6',
    opacity: 0.72,
  },
  backgroundGlowSecondary: {
    position: 'absolute',
    top: 236,
    left: -70,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E7F0E2',
    opacity: 0.7,
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
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
    marginRight: 16,
  },
  avatarLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 22,
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
  userMeta: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
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
  preferencesRow: {
    marginBottom: 18,
    gap: 12,
  },
  preferenceCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    ...UI_SHADOWS.card,
  },
  preferenceLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 8,
  },
  preferenceValue: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  preferenceDetail: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 6,
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
  menuGroupCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    overflow: 'hidden',
    marginBottom: 14,
    ...UI_SHADOWS.card,
  },
  menuGroupHeader: {
    paddingTop: 16,
    paddingHorizontal: 18,
    paddingBottom: 4,
  },
  menuGroupTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  menuRowPressable: {
    alignSelf: 'stretch',
  },
  menuRowFrame: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  menuRowPressed: {
    backgroundColor: '#FFFBF7',
  },
  menuRowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  menuMonogram: {
    width: 48,
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  menuMonogramLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.45,
    lineHeight: 14,
  },
  menuRowCopy: {
    flex: 1,
  },
  menuRowLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  menuMetaChip: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderRadius: UI_RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    maxWidth: '100%',
  },
  menuMetaChipLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  menuRowIndicatorWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  menuRowIndicator: {
    marginLeft: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: UI_COLORS.border,
    marginLeft: 80,
    marginRight: 18,
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
});

export default AccountScreen;
