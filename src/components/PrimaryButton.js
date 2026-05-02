import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_PRESS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../constants/ui';
import ScalePressable from './ScalePressable';

function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  labelStyle,
}) {
  const isSecondary = variant === 'secondary';
  const isDisabled = disabled || loading;
  const indicatorColor = isSecondary
    ? UI_COLORS.textStrong
    : UI_COLORS.surface;

  return (
    <ScalePressable
      disabled={isDisabled}
      onPress={onPress}
      pressScale={UI_PRESS.scale.button}
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.secondaryButton : styles.primaryButton,
        pressed && !isDisabled && styles.pressedButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={indicatorColor}
            size="small"
            style={styles.loadingIndicator}
          />
        ) : null}

        <Text
          style={[
            styles.label,
            isSecondary ? styles.secondaryLabel : styles.primaryLabel,
            labelStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </ScalePressable>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: UI_COLORS.accentGreen,
    borderColor: UI_COLORS.accentGreen,
    ...UI_SHADOWS.card,
  },
  secondaryButton: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderColor: UI_COLORS.borderSoft,
  },
  pressedButton: {
    opacity: UI_PRESS.opacity.strong,
  },
  disabledButton: {
    opacity: UI_PRESS.opacity.disabled,
  },
  loadingIndicator: {
    marginRight: 10,
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
