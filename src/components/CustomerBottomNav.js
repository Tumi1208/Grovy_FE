import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { CUSTOMER_ROUTES } from '../constants/routes';
import { UI_COLORS, UI_MOTION, UI_PRESS, UI_SHADOWS } from '../constants/ui';
import ScalePressable from './ScalePressable';

const NAV_COLORS = Object.freeze({
  surface: UI_COLORS.surface,
  border: UI_COLORS.border,
  text: UI_COLORS.mutedStrong,
  textStrong: UI_COLORS.textStrong,
  active: UI_COLORS.accentGreen,
  activeSoft: UI_COLORS.accentGreenSoft,
  badge: UI_COLORS.accentRed,
});
const NAV_PILL_TRANSITION_MS = UI_MOTION.normal;
const NAV_ITEM_TRANSITION_MS = UI_MOTION.normal;

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

const NAV_ITEMS = Object.freeze([
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
    showsBadge: true,
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
]);

function BottomNavigationItem({
  active = false,
  badgeCount = 0,
  label,
  onPress,
  renderIcon,
  route,
  showsBadge = false,
}) {
  const activeProgress = useRef(new Animated.Value(active ? 1 : 0)).current;
  const badgeVisibility = useRef(
    new Animated.Value(showsBadge && badgeCount > 0 ? 1 : 0),
  ).current;

  useEffect(() => {
    Animated.timing(activeProgress, {
      toValue: active ? 1 : 0,
      duration: NAV_ITEM_TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [active, activeProgress]);

  useEffect(() => {
    Animated.timing(badgeVisibility, {
      toValue: showsBadge && badgeCount > 0 ? 1 : 0,
      duration: UI_MOTION.fast,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [badgeCount, badgeVisibility, showsBadge]);

  const animatedContentStyle = useMemo(
    () => ({
      transform: [
        {
          translateY: activeProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -1],
          }),
        },
        {
          scale: activeProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.02],
          }),
        },
      ],
    }),
    [activeProgress],
  );

  const inactiveLayerStyle = useMemo(
    () => ({
      opacity: activeProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      }),
      transform: [
        {
          translateY: activeProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
        {
          scale: activeProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.94],
          }),
        },
      ],
    }),
    [activeProgress],
  );

  const activeLayerStyle = useMemo(
    () => ({
      opacity: activeProgress,
      transform: [
        {
          translateY: activeProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        },
        {
          scale: activeProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.94, 1],
          }),
        },
      ],
    }),
    [activeProgress],
  );

  const animatedBadgeStyle = useMemo(
    () => ({
      opacity: badgeVisibility,
      transform: [
        {
          translateY: activeProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -1],
          }),
        },
        {
          scale: badgeVisibility.interpolate({
            inputRange: [0, 1],
            outputRange: [0.84, 1],
          }),
        },
      ],
    }),
    [activeProgress, badgeVisibility],
  );

  const badgeLabel = badgeCount > 0 ? `${badgeCount}` : '';

  return (
    <ScalePressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      android_ripple={{ color: '#E9F0E6' }}
      onPress={onPress}
      pressScale={UI_PRESS.scale.default}
      style={({ pressed }) => [
        styles.navItem,
        pressed && styles.navItemPressed,
      ]}
      testID={`bottom-nav-tab-${route}`}
    >
      <Animated.View style={[styles.navItemInner, animatedContentStyle]}>
        <View style={styles.iconWrap}>
          <Animated.View
            pointerEvents="none"
            style={[styles.iconLayer, inactiveLayerStyle]}
          >
            {renderIcon(false)}
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[styles.iconLayer, activeLayerStyle]}
          >
            {renderIcon(true)}
          </Animated.View>

          {showsBadge ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.badge, animatedBadgeStyle]}
            >
              {badgeLabel ? (
                <Text style={styles.badgeLabel}>{badgeLabel}</Text>
              ) : null}
            </Animated.View>
          ) : null}
        </View>

        <View style={styles.labelWrap}>
          <Text
            style={[styles.label, styles.labelActive, styles.labelPlaceholder]}
          >
            {label}
          </Text>
          <Animated.View
            pointerEvents="none"
            style={[styles.labelLayer, inactiveLayerStyle]}
          >
            <Text style={styles.label}>{label}</Text>
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[styles.labelLayer, activeLayerStyle]}
          >
            <Text style={[styles.label, styles.labelActive]}>{label}</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </ScalePressable>
  );
}

function CustomerBottomNav({
  activeRoute,
  navigation,
  onNavigate,
  totalItems = 0,
}) {
  const [itemsRowWidth, setItemsRowWidth] = useState(0);
  const activeIndex = Math.max(
    NAV_ITEMS.findIndex(item => item.route === activeRoute),
    0,
  );
  const indicatorIndex = useRef(new Animated.Value(activeIndex)).current;
  const itemWidth = itemsRowWidth > 0 ? itemsRowWidth / NAV_ITEMS.length : 0;

  useEffect(() => {
    Animated.timing(indicatorIndex, {
      toValue: activeIndex,
      duration: NAV_PILL_TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, indicatorIndex]);

  const handleNavigate = useCallback(
    targetRoute => {
      if (!targetRoute || activeRoute === targetRoute) {
        return;
      }

      if (typeof onNavigate === 'function') {
        onNavigate(targetRoute);
        return;
      }

      navigation?.navigate?.(targetRoute);
    },
    [activeRoute, navigation, onNavigate],
  );

  const handleItemsRowLayout = useCallback(event => {
    const nextWidth = event.nativeEvent.layout.width;

    setItemsRowWidth(currentWidth =>
      currentWidth === nextWidth ? currentWidth : nextWidth,
    );
  }, []);

  const animatedIndicatorStyle = useMemo(() => {
    if (!itemWidth) {
      return [styles.activePill, styles.activePillHidden];
    }

    return [
      styles.activePill,
      {
        width: itemWidth,
        transform: [
          {
            translateX: Animated.multiply(indicatorIndex, itemWidth),
          },
        ],
      },
    ];
  }, [indicatorIndex, itemWidth]);

  return (
    <View style={styles.navBar}>
      <View onLayout={handleItemsRowLayout} style={styles.itemsRow}>
        <Animated.View pointerEvents="none" style={animatedIndicatorStyle} />

        {NAV_ITEMS.map(item => {
          const isActive = activeRoute === item.route;

          return (
            <BottomNavigationItem
              key={item.route}
              active={isActive}
              badgeCount={item.showsBadge ? totalItems : 0}
              label={item.label}
              onPress={() => handleNavigate(item.route)}
              renderIcon={item.renderIcon}
              route={item.route}
              showsBadge={item.showsBadge}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 253, 250, 0.98)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: NAV_COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 7,
    ...UI_SHADOWS.floating,
  },
  itemsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 20,
    backgroundColor: NAV_COLORS.activeSoft,
    borderWidth: 1,
    borderColor: '#D7E5D2',
  },
  activePillHidden: {
    opacity: 0,
  },
  navItem: {
    flex: 1,
    zIndex: 1,
  },
  navItemInner: {
    minHeight: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemPressed: {
    opacity: UI_PRESS.opacity.soft,
  },
  iconWrap: {
    width: 30,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  iconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    minHeight: 14,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  labelLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: NAV_COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  labelActive: {
    color: NAV_COLORS.active,
    fontWeight: '700',
  },
  labelPlaceholder: {
    opacity: 0,
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
