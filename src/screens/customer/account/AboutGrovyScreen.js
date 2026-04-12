import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AccountScene from '../../../components/account/AccountScene';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../../constants/ui';
import { ABOUT_GROVY_CONTENT } from '../../../data/accountMockData';

function HighlightCard({ body, title }) {
  return (
    <View style={styles.highlightCard}>
      <Text style={styles.highlightTitle}>{title}</Text>
      <Text style={styles.highlightBody}>{body}</Text>
    </View>
  );
}

function AboutGrovyScreen({ navigation }) {
  return (
    <AccountScene
      eyebrow="Account"
      navigation={navigation}
      subtitle="A quick look at what Grovy is trying to make easier for everyday grocery shopping."
      title="About Grovy"
    >
      <View style={styles.heroCard}>
        <View style={styles.logoWrap}>
          <View style={styles.logoLeafLeft} />
          <View style={styles.logoLeafRight} />
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.appName}>{ABOUT_GROVY_CONTENT.appName}</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeLabel}>
              {ABOUT_GROVY_CONTENT.version}
            </Text>
          </View>
        </View>

        <Text style={styles.heroDescription}>{ABOUT_GROVY_CONTENT.description}</Text>
      </View>

      <HighlightCard
        body={ABOUT_GROVY_CONTENT.mission}
        title="Mission"
      />

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Why Grovy</Text>
        {ABOUT_GROVY_CONTENT.whyGrovy.map(point => (
          <View key={point} style={styles.listRow}>
            <View style={styles.listBullet} />
            <Text style={styles.listBody}>{point}</Text>
          </View>
        ))}
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Project credits</Text>
        {ABOUT_GROVY_CONTENT.credits.map(point => (
          <View key={point} style={styles.listRow}>
            <View style={styles.listBulletSoft} />
            <Text style={styles.listBody}>{point}</Text>
          </View>
        ))}
      </View>
    </AccountScene>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: UI_COLORS.banner,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: '#E4D3BD',
    padding: 22,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  logoWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: UI_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoLeafLeft: {
    position: 'absolute',
    width: 18,
    height: 28,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: UI_COLORS.accentGreen,
    transform: [{ rotate: '-22deg' }, { translateX: -8 }],
  },
  logoLeafRight: {
    position: 'absolute',
    width: 18,
    height: 28,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: UI_COLORS.accentGreen,
    transform: [{ rotate: '22deg' }, { translateX: 8 }],
  },
  heroCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    color: UI_COLORS.textStrong,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    marginRight: 12,
  },
  versionBadge: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  versionBadgeLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  heroDescription: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.body,
    maxWidth: '92%',
  },
  highlightCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  highlightTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
    marginBottom: 8,
  },
  highlightBody: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
  },
  listCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  listTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
    marginBottom: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  listBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: UI_COLORS.accentGreen,
    marginTop: 7,
    marginRight: 10,
  },
  listBulletSoft: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: UI_COLORS.bannerAccent,
    marginTop: 7,
    marginRight: 10,
  },
  listBody: {
    flex: 1,
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
  },
});

export default AboutGrovyScreen;
