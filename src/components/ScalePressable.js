import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { UI_PRESS } from '../constants/ui';

function ScalePressable({
  children,
  contentStyle,
  disabled = false,
  onPressIn,
  onPressOut,
  pressInDuration = UI_PRESS.timing.in,
  pressOutDuration = UI_PRESS.timing.out,
  pressScale = UI_PRESS.scale.default,
  style,
  ...props
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = useCallback(
    (toValue, duration) => {
      Animated.timing(scale, {
        toValue,
        duration,
        easing:
          toValue < 1
            ? Easing.out(Easing.quad)
            : Easing.bezier(0.2, 0.85, 0.25, 1),
        useNativeDriver: true,
      }).start();
    },
    [scale],
  );

  const handlePressIn = useCallback(
    event => {
      if (!disabled) {
        animateScale(pressScale, pressInDuration);
      }

      onPressIn?.(event);
    },
    [animateScale, disabled, onPressIn, pressInDuration, pressScale],
  );

  const handlePressOut = useCallback(
    event => {
      animateScale(1, pressOutDuration);
      onPressOut?.(event);
    },
    [animateScale, onPressOut, pressOutDuration],
  );

  const animatedContentStyle = useMemo(
    () => [
      styles.content,
      contentStyle,
      {
        transform: [{ scale }],
      },
    ],
    [contentStyle, scale],
  );

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      {state => {
        const resolvedChildren =
          typeof children === 'function' ? children(state) : children;

        return (
          <Animated.View style={animatedContentStyle}>
            {resolvedChildren}
          </Animated.View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {},
});

export default ScalePressable;
