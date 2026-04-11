import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CUSTOMER_ROUTES } from '../constants/routes';
import { UI_COLORS, UI_SHADOWS } from '../constants/ui';

const NAV_COLORS = Object.freeze({
  surface: UI_COLORS.surface,
  border: UI_COLORS.border,
  text: UI_COLORS.mutedStrong,
  textStrong: UI_COLORS.textStrong,
  active: UI_COLORS.accentGreen,
  activeSoft: UI_COLORS.accentGreenSoft,
  badge: UI_COLORS.accentRed,
});

function SearchGlyph({ active = false }) {
  return (
    <View style={styles.searchGlyph}>
      <View
        style={[
          styles.searchGlyphCircle,
          active && styles.iconBorderActive,
          active && styles.iconFillSoft,
        ]}
      />
      <View
        style={[styles.searchGlyphHandle, active && styles.iconFillActive]}
      />
    </View>
  );
}

function ShopGlyph({ active = false }) {
  return (
    <View style={styles.shopGlyph}>
      <View style={[styles.shopGlyphRoof, active && styles.iconBorderActive]} />
      <View style={[styles.shopGlyphBody, active && styles.iconBorderActive]} />
      <View style={[styles.shopGlyphDoor, active && styles.iconFillActive]} />
    </View>
  );
}

function CartGlyph({ active = false }) {
  return (
    <View style={styles.cartGlyph}>
      <View style={[styles.cartGlyphHandle, active && styles.iconFillActive]} />
      <View
        style={[styles.cartGlyphBasket, active && styles.iconBorderActive]}
      />
      <View style={styles.cartGlyphWheelRow}>
        <View
          style={[styles.cartGlyphWheel, active && styles.iconBorderActive]}
        />
        <View
          style={[styles.cartGlyphWheel, active && styles.iconBorderActive]}
        />
      </View>
    </View>
  );
}

function FavouriteGlyph({ active = false }) {
  return (
    <Text style={[styles.heartGlyph, active && styles.textActive]}>
      {active ? '♥' : '♡'}
    </Text>
  );
}

function ProfileGlyph({ active = false }) {
  return (
    <View style={styles.profileGlyph}>
      <View
        style={[styles.profileGlyphHead, active && styles.iconBorderActive]}
      />
      <View
        style={[styles.profileGlyphBody, active && styles.iconBorderActive]}
      />
    </View>
  );
}

function BottomNavigationItem({
  active = false,
  badgeCount = 0,
  icon,
  label,
  onPress,
}) {
  return (
    <Pressable
      android_ripple={{ color: '#E9F0E6' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        pressed && styles.navItemPressed,
      ]}
    >
      <View style={[styles.navItemInner, active && styles.navItemInnerActive]}>
        <View style={styles.iconWrap}>
          {icon}
          {badgeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{badgeCount}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.label, active && styles.labelActive]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function CustomerBottomNav({ activeRoute, navigation, totalItems = 0 }) {
  const items = [
    {
      route: CUSTOMER_ROUTES.HOME,
      label: 'Shop',
      renderIcon: isActive => <ShopGlyph active={isActive} />,
    },
    {
      route: CUSTOMER_ROUTES.EXPLORE,
      label: 'Explore',
      renderIcon: isActive => <SearchGlyph active={isActive} />,
    },
    {
      route: CUSTOMER_ROUTES.CART,
      label: 'Cart',
      renderIcon: isActive => <CartGlyph active={isActive} />,
      badgeCount: totalItems,
    },
    {
      route: CUSTOMER_ROUTES.FAVOURITE,
      label: 'Saved',
      renderIcon: isActive => <FavouriteGlyph active={isActive} />,
    },
    {
      route: CUSTOMER_ROUTES.ACCOUNT,
      label: 'Account',
      renderIcon: isActive => <ProfileGlyph active={isActive} />,
    },
  ];

  function handleNavigate(targetRoute) {
    if (!targetRoute || activeRoute === targetRoute) {
      return;
    }

    navigation.navigate(targetRoute);
  }

  return (
    <View style={styles.navBar}>
      {items.map(item => {
        const isActive = activeRoute === item.route;

        return (
          <BottomNavigationItem
            key={item.route}
            active={isActive}
            badgeCount={item.badgeCount}
            icon={item.renderIcon(isActive)}
            label={item.label}
            onPress={() => handleNavigate(item.route)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAV_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: NAV_COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
    ...UI_SHADOWS.floating,
  },
  navItem: {
    flex: 1,
  },
  navItemInner: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemInnerActive: {
    backgroundColor: NAV_COLORS.activeSoft,
    borderWidth: 1,
    borderColor: '#DEE9D9',
  },
  navItemPressed: {
    opacity: 0.88,
  },
  iconWrap: {
    minWidth: 28,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    color: NAV_COLORS.text,
    fontSize: 10.5,
    fontWeight: '600',
  },
  labelActive: {
    color: NAV_COLORS.active,
    fontWeight: '700',
  },
  textActive: {
    color: NAV_COLORS.active,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -9,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: NAV_COLORS.badge,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    color: NAV_COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  iconBorderActive: {
    borderColor: NAV_COLORS.active,
  },
  iconFillActive: {
    backgroundColor: NAV_COLORS.active,
  },
  iconFillSoft: {
    backgroundColor: 'transparent',
  },
  searchGlyph: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  searchGlyphCircle: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.8,
    borderColor: NAV_COLORS.text,
  },
  searchGlyphHandle: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: NAV_COLORS.text,
    transform: [{ rotate: '45deg' }],
  },
  shopGlyph: {
    width: 18,
    height: 18,
    alignItems: 'center',
  },
  shopGlyphRoof: {
    width: 16,
    height: 5,
    borderWidth: 1.7,
    borderColor: NAV_COLORS.text,
    borderBottomWidth: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  shopGlyphBody: {
    width: 14,
    height: 9,
    borderWidth: 1.7,
    borderColor: NAV_COLORS.text,
    borderRadius: 2,
    marginTop: -1,
  },
  shopGlyphDoor: {
    position: 'absolute',
    bottom: 1,
    width: 4,
    height: 5,
    borderRadius: 1,
    backgroundColor: NAV_COLORS.text,
  },
  cartGlyph: {
    width: 20,
    height: 18,
    alignItems: 'center',
  },
  cartGlyphHandle: {
    position: 'absolute',
    top: 1,
    left: 2,
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: NAV_COLORS.text,
    transform: [{ rotate: '-25deg' }],
  },
  cartGlyphBasket: {
    width: 14,
    height: 8,
    borderWidth: 1.7,
    borderColor: NAV_COLORS.text,
    borderRadius: 2,
    marginTop: 4,
  },
  cartGlyphWheelRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: 12,
    justifyContent: 'space-between',
  },
  cartGlyphWheel: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: NAV_COLORS.text,
  },
  heartGlyph: {
    color: NAV_COLORS.text,
    fontSize: 17,
    lineHeight: 17,
  },
  profileGlyph: {
    width: 18,
    height: 18,
    alignItems: 'center',
  },
  profileGlyphHead: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.7,
    borderColor: NAV_COLORS.text,
    marginBottom: 2,
  },
  profileGlyphBody: {
    width: 12,
    height: 7,
    borderWidth: 1.7,
    borderColor: NAV_COLORS.text,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 0,
  },
});

export default CustomerBottomNav;
