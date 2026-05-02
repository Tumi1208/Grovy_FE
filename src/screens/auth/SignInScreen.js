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

function SignInScreen({ navigation }) {
  const { signIn } = useApp();
  const passwordInputRef = useRef(null);
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
      heroBadges={['Saved details', 'Order history', 'Faster checkout']}
      onPressBack={handleBack}
      subtitle="Sign in to pick up where you left off with your delivery details, saved items, and recent orders."
      switchRow={
        <AuthSwitchRow
          actionLabel="Create one"
          onPressAction={() => navigation.navigate(AUTH_ROUTES.SIGN_UP)}
          prompt="New to Grovy?"
        />
      }
      title="Sign in to your Grovy account"
    >
      <AuthNotice message={errorMessage} />

      <AuthTextField
        autoCapitalize="none"
        autoComplete="email"
        autoFocus
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
      />

      <AuthTextField
        autoComplete="current-password"
        blurOnSubmit={false}
        editable={!isSubmitting}
        helperText="Use the same account you shop with so your cart and saved details stay in sync."
        label="Password"
        onChangeText={value => {
          setPassword(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        onSubmitEditing={handleSignIn}
        placeholder="Enter your password"
        returnKeyType="done"
        secureTextEntry
        submitBehavior="submit"
        textContentType="password"
        value={password}
        ref={passwordInputRef}
      />

      <PrimaryButton
        loading={isSubmitting}
        onPress={handleSignIn}
        style={styles.submitButton}
        labelStyle={styles.submitButtonLabel}
        title={isSubmitting ? 'Signing you in...' : 'Continue to Grovy'}
      />

      <Text style={styles.supportText}>
        Grovy will take you to the right next step for this account, including
        location setup if it is still missing.
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

export default SignInScreen;
