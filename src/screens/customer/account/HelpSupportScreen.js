import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AccountScene from '../../../components/account/AccountScene';
import ChevronIcon from '../../../components/icons/ChevronIcon';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../../constants/ui';
import {
  DELIVERY_POLICY_POINTS,
  HELP_CONTACT_CHANNELS,
  HELP_FAQ_ITEMS,
  REFUND_POLICY_POINTS,
} from '../../../data/accountMockData';

function FaqItem({ isExpanded, item, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#EEE6DC' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.faqItem,
        pressed && styles.faqItemPressed,
      ]}
    >
      <View style={styles.faqTopRow}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <ChevronIcon
          color={UI_COLORS.mutedStrong}
          direction={isExpanded ? 'down' : 'right'}
          size={12}
          strokeWidth={1.9}
        />
      </View>
      {isExpanded ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
    </Pressable>
  );
}

function PolicyCard({ points, title }) {
  return (
    <View style={styles.policyCard}>
      <Text style={styles.policyTitle}>{title}</Text>
      {points.map(point => (
        <View key={point} style={styles.policyPointRow}>
          <View style={styles.policyBullet} />
          <Text style={styles.policyPoint}>{point}</Text>
        </View>
      ))}
    </View>
  );
}

function HelpSupportScreen({ navigation }) {
  const [expandedFaqId, setExpandedFaqId] = useState(HELP_FAQ_ITEMS[0]?.id || '');

  return (
    <AccountScene
      eyebrow="Account"
      navigation={navigation}
      subtitle="Quick answers, support channels and core grocery policies in one place."
      title="Help & Support"
    >
      <View style={styles.contactSection}>
        {HELP_CONTACT_CHANNELS.map(channel => (
          <View key={channel.id} style={styles.contactCard}>
            <Text style={styles.contactTitle}>{channel.title}</Text>
            <Text style={styles.contactValue}>{channel.value}</Text>
            <Text style={styles.contactDescription}>{channel.description}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>FAQ</Text>
      {HELP_FAQ_ITEMS.map(item => (
        <FaqItem
          isExpanded={expandedFaqId === item.id}
          item={item}
          key={item.id}
          onPress={() =>
            setExpandedFaqId(currentValue =>
              currentValue === item.id ? '' : item.id,
            )
          }
        />
      ))}

      <Text style={styles.sectionLabel}>Policies</Text>
      <PolicyCard points={DELIVERY_POLICY_POINTS} title="Delivery policy" />
      <PolicyCard points={REFUND_POLICY_POINTS} title="Refund policy" />
    </AccountScene>
  );
}

const styles = StyleSheet.create({
  contactSection: {
    marginBottom: 18,
  },
  contactCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 12,
    ...UI_SHADOWS.card,
  },
  contactTitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 6,
  },
  contactValue: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 6,
  },
  contactDescription: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  sectionLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 10,
    marginTop: 4,
  },
  faqItem: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 12,
    ...UI_SHADOWS.card,
  },
  faqItemPressed: {
    opacity: 0.95,
  },
  faqTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    paddingRight: 12,
  },
  faqAnswer: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 12,
  },
  policyCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 14,
    ...UI_SHADOWS.card,
  },
  policyTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 12,
  },
  policyPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  policyBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: UI_COLORS.accentGreen,
    marginTop: 7,
    marginRight: 10,
  },
  policyPoint: {
    flex: 1,
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
  },
});

export default HelpSupportScreen;
