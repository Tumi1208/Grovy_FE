import React from 'react';
import { StyleSheet, View } from 'react-native';
import { UI_COLORS } from '../constants/ui';
import ChevronIcon from './icons/ChevronIcon';

function DirectionalHint({
  chevronSize = 8,
  color = UI_COLORS.mutedStrong,
  direction = 'right',
  mode = 'soft',
  size = 20,
  strokeWidth = 1.55,
  style,
}) {
  if (mode === 'plain') {
    return (
      <View style={[styles.plain, style]}>
        <ChevronIcon
          color={color}
          direction={direction}
          size={chevronSize}
          strokeWidth={strokeWidth}
          style={styles.chevron}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        mode === 'tinted' ? styles.badgeTinted : styles.badgeSoft,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <ChevronIcon
        color={color}
        direction={direction}
        size={chevronSize}
        strokeWidth={strokeWidth}
        style={styles.chevron}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSoft: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI_COLORS.borderSoft,
  },
  badgeTinted: {
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  plain: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.84,
  },
  chevron: {
    marginLeft: -0.4,
  },
});

export default DirectionalHint;
