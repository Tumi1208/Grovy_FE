import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { AUTH_ROUTES } from '../../constants/routes';
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
      eyebrow="New account"
      heroBadges={[
        'Auto sign in',
        'Separate account data',
        'Easy demo flow',
      ]}
      onPressBack={handleBack}
      subtitle="Create a new Grovy account and the app will immediately continue with that profile."
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
        label="Full name"
        onChangeText={value => {
          setDisplayName(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        placeholder="Demo Shopper C"
        textContentType="name"
        value={displayName}
      />

      <AuthTextField
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        label="Email"
        onChangeText={value => {
          setEmail(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        placeholder="yourname@grovy.app"
        textContentType="emailAddress"
        value={email}
      />

      <AuthTextField
        autoComplete="password"
        label="Password"
        onChangeText={value => {
          setPassword(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        placeholder="At least 6 characters"
        secureTextEntry
        textContentType="newPassword"
        value={password}
      />

      <AuthTextField
        autoComplete="password"
        label="Confirm password"
        onChangeText={value => {
          setConfirmPassword(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        placeholder="Re-enter your password"
        secureTextEntry
        textContentType="password"
        value={confirmPassword}
      />

      <PrimaryButton
        disabled={isSubmitting}
        onPress={handleSignUp}
        style={styles.submitButton}
        title={isSubmitting ? 'Creating account...' : 'Sign Up'}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: 6,
  },
});

export default SignUpScreen;
