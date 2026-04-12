import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import AccountScene from '../../../components/account/AccountScene';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../../constants/ui';
import {
  NOTIFICATION_SETTING_OPTIONS,
} from '../../../data/accountMockData';
import { useAccountData } from '../../../context/AccountDataContext';

function NotificationsSettingsScreen({ navigation }) {
  const { notificationSettings, updateNotificationSetting } = useAccountData();

  return (
    <AccountScene
      eyebrow="Account"
      navigation={navigation}
      subtitle="Choose the updates you want to keep from Grovy. Preferences are stored locally for this MVP."
      title="Notifications"
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Only the updates that matter</Text>
        <Text style={styles.heroCopy}>
          Delivery moments stay on, promos stay optional and everything can be changed later.
        </Text>
      </View>

      {NOTIFICATION_SETTING_OPTIONS.map(option => (
        <View key={option.key} style={styles.settingCard}>
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>{option.title}</Text>
            <Text style={styles.settingDescription}>{option.description}</Text>
          </View>

          <Switch
            onValueChange={value => updateNotificationSetting(option.key, value)}
            thumbColor={
              notificationSettings[option.key]
                ? UI_COLORS.surface
                : UI_COLORS.surface
            }
            trackColor={{
              false: '#D9D0C4',
              true: UI_COLORS.accentGreen,
            }}
            value={Boolean(notificationSettings[option.key])}
          />
        </View>
      ))}
    </AccountScene>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: UI_COLORS.bannerSoft,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: '#D7E1CC',
    padding: 20,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  heroTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
    marginBottom: 8,
  },
  heroCopy: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 14,
    ...UI_SHADOWS.card,
  },
  settingCopy: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  settingDescription: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
});

export default NotificationsSettingsScreen;
