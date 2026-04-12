import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChevronIcon from '../icons/ChevronIcon';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';

function HeaderButton({ children, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#EEE6DC' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerButton,
        pressed && styles.headerButtonPressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

function AccountScene({
  children,
  contentContainerStyle,
  eyebrow = 'Account',
  footer,
  navigation,
  rightAccessory = null,
  subtitle,
  title,
}) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <HeaderButton onPress={() => navigation.goBack()}>
            <ChevronIcon
              color={UI_COLORS.textStrong}
              direction="left"
              size={12}
              strokeWidth={1.9}
            />
          </HeaderButton>

          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </View>

          {rightAccessory ? (
            <View style={styles.rightAccessoryWrap}>{rightAccessory}</View>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            footer ? styles.contentWithFooter : null,
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerButton: {
    width: UI_LAYOUT.iconButton,
    height: UI_LAYOUT.iconButton,
    borderRadius: UI_RADIUS.lg,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerButtonPressed: {
    opacity: 0.88,
  },
  headerCopy: {
    flex: 1,
  },
  rightAccessoryWrap: {
    marginLeft: 14,
  },
  headerEyebrow: {
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
    ...UI_TYPOGRAPHY.sectionTitle,
  },
  headerSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 2,
    paddingBottom: 48,
  },
  contentWithFooter: {
    paddingBottom: 168,
  },
  footer: {
    position: 'absolute',
    left: UI_LAYOUT.footerSide,
    right: UI_LAYOUT.footerSide,
    bottom: UI_LAYOUT.footerBottom,
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 9,
    ...UI_SHADOWS.floating,
  },
});

export { HeaderButton };
export default AccountScene;
