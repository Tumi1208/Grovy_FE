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

function SignInScreen({ navigation }) {
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(AUTH_ROUTES.ENTRY);
  };

  async function handleSignIn() {
    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await signIn({
        email: normalizedEmail,
        password,
      });
    } catch (error) {
      setErrorMessage(
        error.message || 'We could not sign you in. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      eyebrow="Welcome back"
      heroBadges={[
        'Email sign in',
        'MongoDB profile',
        'Persistent session',
      ]}
      onPressBack={handleBack}
      subtitle="Sign in with your Grovy account to load the right profile, account data and saved edits."
      switchRow={
        <AuthSwitchRow
          actionLabel="Create one"
          onPressAction={() => navigation.navigate(AUTH_ROUTES.SIGN_UP)}
          prompt="New to Grovy?"
        />
      }
      title="Sign in to your account"
    >
      <AuthNotice message={errorMessage} />

      <AuthTextField
        autoCapitalize="none"
        autoComplete="email"
        autoFocus
        keyboardType="email-address"
        label="Email"
        onChangeText={value => {
          setEmail(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        placeholder="demo.a@grovy.app"
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
        placeholder="Enter your password"
        secureTextEntry
        textContentType="password"
        value={password}
      />

      <PrimaryButton
        disabled={isSubmitting}
        onPress={handleSignIn}
        style={styles.submitButton}
        title={isSubmitting ? 'Signing in...' : 'Sign In'}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: 6,
  },
});

export default SignInScreen;
