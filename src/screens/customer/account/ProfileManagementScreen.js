import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AccountScene from '../../../components/account/AccountScene';
import PrimaryButton from '../../../components/PrimaryButton';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../../constants/ui';
import { useApp } from '../../../context/AppContext';
import { getUserInitials } from '../../../utils/userProfile';
import {
  AuthNotice,
  AuthTextField,
} from '../../auth/AuthScreenLayout';

function isValidPhone(phone) {
  if (!phone) {
    return true;
  }

  return /^[0-9+()\-\s]{8,20}$/.test(`${phone}`.trim());
}

function isValidAvatarUrl(avatarUrl) {
  if (!avatarUrl) {
    return true;
  }

  return /^https?:\/\//i.test(`${avatarUrl}`.trim());
}

function ProfileManagementScreen({ navigation }) {
  const { currentUser, updateCurrentUser } = useApp();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(currentUser?.displayName || '');
    setPhone(currentUser?.phone || '');
    setAvatarUrl(currentUser?.avatarUrl || '');
  }, [currentUser?.avatarUrl, currentUser?.displayName, currentUser?.phone]);

  const initialSnapshot = useMemo(
    () => ({
      avatarUrl: currentUser?.avatarUrl || '',
      displayName: currentUser?.displayName || '',
      phone: currentUser?.phone || '',
    }),
    [currentUser?.avatarUrl, currentUser?.displayName, currentUser?.phone],
  );

  const hasChanges =
    displayName.trim() !== initialSnapshot.displayName ||
    phone.trim() !== initialSnapshot.phone ||
    avatarUrl.trim() !== initialSnapshot.avatarUrl;

  async function handleSave() {
    if (isSaving || !hasChanges) {
      return;
    }

    if (!displayName.trim()) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }

    if (!isValidPhone(phone)) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    if (!isValidAvatarUrl(avatarUrl)) {
      setErrorMessage('Avatar URL must start with http:// or https://.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await updateCurrentUser({
        avatarUrl: avatarUrl.trim(),
        displayName: displayName.trim(),
        email: currentUser?.email || '',
        phone: phone.trim(),
      });
      setSuccessMessage(
        result.message || 'Your profile details have been updated.',
      );
    } catch (error) {
      setErrorMessage(
        error.message || 'We could not save your profile right now.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  const initials = getUserInitials(displayName || currentUser?.displayName || '');
  const resolvedAvatarUrl = avatarUrl.trim();

  return (
    <AccountScene
      eyebrow="Account"
      footer={
        <PrimaryButton
          disabled={!hasChanges || isSaving}
          onPress={handleSave}
          title={isSaving ? 'Saving...' : 'Save'}
        />
      }
      navigation={navigation}
      subtitle="Changes are saved to MongoDB and will still be there after you reopen the app."
      title="Profile Management"
    >
      <View style={styles.heroCard}>
        <View style={styles.avatarWrap}>
          {resolvedAvatarUrl ? (
            <Image source={{ uri: resolvedAvatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{displayName.trim() || 'Your profile'}</Text>
          <Text style={styles.heroSubtitle}>
            {currentUser?.email || 'Signed in account'}
          </Text>
        </View>
      </View>

      <AuthNotice message={errorMessage} />
      <AuthNotice message={successMessage} tone="success" />

      <View style={styles.formCard}>
        <AuthTextField
          autoCapitalize="words"
          label="Full name"
          onChangeText={value => {
            setDisplayName(value);
            if (errorMessage) {
              setErrorMessage('');
            }
            if (successMessage) {
              setSuccessMessage('');
            }
          }}
          placeholder="Your display name"
          value={displayName}
        />

        <AuthTextField
          autoCapitalize="none"
          editable={false}
          keyboardType="email-address"
          label="Email"
          value={currentUser?.email || ''}
        />

        <AuthTextField
          keyboardType="phone-pad"
          label="Phone"
          onChangeText={value => {
            setPhone(value);
            if (errorMessage) {
              setErrorMessage('');
            }
            if (successMessage) {
              setSuccessMessage('');
            }
          }}
          placeholder="+84 901 234 567"
          value={phone}
        />

        <AuthTextField
          autoCapitalize="none"
          keyboardType="url"
          label="Avatar URL"
          onChangeText={value => {
            setAvatarUrl(value);
            if (errorMessage) {
              setErrorMessage('');
            }
            if (successMessage) {
              setSuccessMessage('');
            }
          }}
          placeholder="https://example.com/avatar.jpg"
          value={avatarUrl}
        />

        <Text style={styles.helperText}>
          Email stays read-only in this MVP to keep the demo flow simple.
        </Text>
      </View>
    </AccountScene>
  );
}

const styles = StyleSheet.create({
  heroCard: {
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
  avatarWrap: {
    marginRight: 16,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: UI_COLORS.accentGreenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: UI_COLORS.accentGreen,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  formCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    ...UI_SHADOWS.card,
  },
  helperText: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
});

export default ProfileManagementScreen;
