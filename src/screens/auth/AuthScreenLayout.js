import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import ChevronIcon from '../../components/icons/ChevronIcon';

export function AuthNotice({ message, tone = 'error' }) {
  if (!message) {
    return null;
  }

  const isSuccess = tone === 'success';

  return (
    <View
      style={[
        styles.notice,
        isSuccess ? styles.noticeSuccess : styles.noticeError,
      ]}
    >
      <Text
        style={[
          styles.noticeLabel,
          isSuccess ? styles.noticeLabelSuccess : styles.noticeLabelError,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

export function AuthTextField({
  autoCapitalize = 'none',
  autoComplete,
  autoFocus = false,
  editable = true,
  keyboardType = 'default',
  label,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  textContentType,
  value,
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={false}
        autoFocus={autoFocus}
        editable={editable}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={UI_COLORS.muted}
        secureTextEntry={secureTextEntry}
        selectionColor={UI_COLORS.accentGreen}
        style={[styles.textField, !editable && styles.textFieldReadonly]}
        textContentType={textContentType}
        value={value}
      />
    </View>
  );
}

export function AuthSwitchRow({ prompt, actionLabel, onPressAction }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchPrompt}>{prompt}</Text>
      <Pressable
        hitSlop={8}
        onPress={onPressAction}
        style={({ pressed }) => [
          styles.switchAction,
          pressed && styles.switchActionPressed,
        ]}
      >
        <Text style={styles.switchActionLabel}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function AuthScreenLayout({
  children,
  eyebrow,
  heroBadges = [],
  onPressBack,
  subtitle,
  switchRow,
  title,
}) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar
        backgroundColor={UI_COLORS.screenLight}
        barStyle="dark-content"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {onPressBack ? (
            <View style={styles.topBar}>
              <Pressable
                android_ripple={{ color: '#E7E1D7' }}
                hitSlop={8}
                onPress={onPressBack}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
              >
                <ChevronIcon
                  color={UI_COLORS.textStrong}
                  direction="left"
                  size={10}
                  strokeWidth={2}
                />
                <Text style={styles.backButtonLabel}>Back</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.heroCard}>
            <View style={styles.heroOrbWarm} />
            <View style={styles.heroOrbSoft} />
            <Text style={styles.brand}>Grovy</Text>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.badgeRow}>
              {heroBadges.map(badge => (
                <View key={badge} style={styles.badge}>
                  <Text style={styles.badgeLabel}>{badge}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formCard}>{children}</View>

          {switchRow ? <View style={styles.switchRowWrap}>{switchRow}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.screenLight,
  },
  flexOne: {
    flex: 1,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 28,
  },
  topBar: {
    marginBottom: 12,
  },
  backButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: UI_RADIUS.round,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    backgroundColor: UI_COLORS.surface,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonPressed: {
    opacity: 0.88,
  },
  backButtonLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    marginLeft: 8,
  },
  heroCard: {
    backgroundColor: UI_COLORS.banner,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: '#E1D2BF',
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 24,
    marginBottom: 18,
    ...UI_SHADOWS.card,
  },
  heroOrbWarm: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    top: -52,
    right: -24,
  },
  heroOrbSoft: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(84, 122, 78, 0.12)',
    bottom: -44,
    left: -20,
  },
  brand: {
    color: UI_COLORS.textStrong,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 16,
  },
  eyebrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.35,
    lineHeight: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.screenTitle,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 8,
    maxWidth: '94%',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },
  badge: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: '#E5D5C2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  formCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    ...UI_SHADOWS.card,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 8,
  },
  textField: {
    minHeight: 56,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 16,
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '600',
  },
  textFieldReadonly: {
    opacity: 0.74,
  },
  notice: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  noticeError: {
    backgroundColor: '#FFF5F3',
    borderColor: '#E7CFC7',
  },
  noticeSuccess: {
    backgroundColor: '#EEF6E8',
    borderColor: '#D5E3CA',
  },
  noticeLabel: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  noticeLabelError: {
    color: UI_COLORS.accentRed,
  },
  noticeLabelSuccess: {
    color: UI_COLORS.accentGreen,
  },
  switchRowWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchPrompt: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginRight: 6,
  },
  switchAction: {
    paddingVertical: 4,
  },
  switchActionPressed: {
    opacity: 0.78,
  },
  switchActionLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
});

export default AuthScreenLayout;
