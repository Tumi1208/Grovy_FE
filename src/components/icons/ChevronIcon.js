import React from 'react';
import { StyleSheet, View } from 'react-native';
import { UI_COLORS } from '../../constants/ui';

const CHEVRON_ROTATIONS = Object.freeze({
  up: '-135deg',
  right: '-45deg',
  down: '45deg',
  left: '135deg',
});

function ChevronIcon({
  color = UI_COLORS.mutedStrong,
  direction = 'right',
  size = 12,
  strokeWidth = 1.8,
  style,
}) {
  const dimension = Math.max(6, Math.round(size * 0.58));

  return (
    <View style={[styles.frame, { width: size, height: size }, style]}>
      <View
        style={[
          styles.chevron,
          {
            width: dimension,
            height: dimension,
            borderColor: color,
            borderRightWidth: strokeWidth,
            borderBottomWidth: strokeWidth,
            transform: [
              {
                rotate: CHEVRON_ROTATIONS[direction] || CHEVRON_ROTATIONS.right,
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    borderStyle: 'solid',
  },
});

export default ChevronIcon;
