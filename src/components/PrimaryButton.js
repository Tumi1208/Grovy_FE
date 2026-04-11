import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../constants/ui';

function PrimaryButton({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  labelStyle,
}) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.secondaryButton : styles.primaryButton,
        pressed && !disabled && styles.pressedButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          isSecondary ? styles.secondaryLabel : styles.primaryLabel,
          labelStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: UI_LAYOUT.ctaHeight,
    borderRadius: UI_RADIUS.xl,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: UI_COLORS.accentGreen,
    borderColor: UI_COLORS.accentGreen,
    ...UI_SHADOWS.card,
  },
  secondaryButton: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.border,
  },
  pressedButton: {
    opacity: 0.88,
  },
  disabledButton: {
    opacity: 0.55,
  },
  label: {
    ...UI_TYPOGRAPHY.button,
    letterSpacing: 0.1,
  },
  primaryLabel: {
    color: UI_COLORS.surface,
  },
  secondaryLabel: {
    color: UI_COLORS.textStrong,
  },
});

export default PrimaryButton;
