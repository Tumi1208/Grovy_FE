import React, { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { AUTH_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useApp } from '../../context/AppContext';
import AuthScreenLayout, {
  AuthNotice,
  AuthSwitchRow,
  AuthTextField,
} from './AuthScreenLayout';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(`${email}`.trim().toLowerCase());
}

function SignUpScreen({ navigation }) {
  const { signUp } = useApp();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(AUTH_ROUTES.ENTRY);
  };

  async function handleSignUp() {
    if (isSubmitting) {
      return;
    }

    const trimmedName = displayName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail || !password || !confirmPassword) {
      setErrorMessage('Please complete every field before continuing.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.trim().length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Confirm password must match your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await signUp({
        displayName: trimmedName,
        email: normalizedEmail,
        password,
      });
    } catch (error) {
      setErrorMessage(
        error.message || 'We could not create your account right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      eyebrow="Create account"
      heroBadges={['Secure sign up', 'Saved favourites', 'Nearby delivery']}
      onPressBack={handleBack}
      subtitle="Create your Grovy account to keep your shopping details saved, checkout faster, and unlock nearby delivery."
      switchRow={
        <AuthSwitchRow
          actionLabel="Sign in"
          onPressAction={() => navigation.navigate(AUTH_ROUTES.SIGN_IN)}
          prompt="Already have an account?"
        />
      }
      title="Create your Grovy profile"
    >
      <AuthNotice message={errorMessage} />

      <AuthTextField
        autoCapitalize="words"
        autoComplete="name"
        autoFocus
        blurOnSubmit={false}
        editable={!isSubmitting}
        label="Full name"
        onChangeText={value => {
          setDisplayName(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        onSubmitEditing={() => emailInputRef.current?.focus()}
        placeholder="Your full name"
        returnKeyType="next"
        textContentType="name"
        value={displayName}
      />

      <AuthTextField
        autoCapitalize="none"
        autoComplete="email"
        blurOnSubmit={false}
        editable={!isSubmitting}
        keyboardType="email-address"
        label="Email"
        onChangeText={value => {
          setEmail(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        placeholder="name@example.com"
        returnKeyType="next"
        textContentType="emailAddress"
        value={email}
        ref={emailInputRef}
      />

      <AuthTextField
        autoComplete="new-password"
        blurOnSubmit={false}
        editable={!isSubmitting}
        helperText="Use at least 6 characters so your account is ready for future sign-ins."
        label="Password"
        onChangeText={value => {
          setPassword(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
        placeholder="At least 6 characters"
        returnKeyType="next"
        secureTextEntry
        textContentType="newPassword"
        value={password}
        ref={passwordInputRef}
      />

      <AuthTextField
        autoComplete="new-password"
        editable={!isSubmitting}
        label="Confirm password"
        onChangeText={value => {
          setConfirmPassword(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        onSubmitEditing={handleSignUp}
        placeholder="Re-enter your password"
        returnKeyType="done"
        secureTextEntry
        submitBehavior="submit"
        textContentType="password"
        value={confirmPassword}
        ref={confirmPasswordInputRef}
      />

      <PrimaryButton
        loading={isSubmitting}
        onPress={handleSignUp}
        style={styles.submitButton}
        labelStyle={styles.submitButtonLabel}
        title={isSubmitting ? 'Creating your account...' : 'Create account'}
      />

      <Text style={styles.supportText}>
        Next, Grovy will ask for your delivery location so the app can keep
        your nearby products and checkout flow accurate.
      </Text>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: 4,
  },
  submitButtonLabel: {
    ...UI_TYPOGRAPHY.buttonLarge,
  },
  supportText: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 14,
    textAlign: 'center',
  },
});

export default SignUpScreen;
