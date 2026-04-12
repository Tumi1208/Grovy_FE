import { apiRequest } from './apiClient';
import { normalizeUserProfile } from '../utils/userProfile';

function buildAuthPayload(data) {
  return {
    token: data?.token || '',
    user: normalizeUserProfile(data?.user),
    message: data?.message || '',
  };
}

export async function signInWithEmail({ email, password }) {
  const data = await apiRequest('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return buildAuthPayload(data);
}

export async function signUpWithEmail({ displayName, email, password }) {
  const data = await apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      displayName,
      email,
      password,
    }),
  });

  return buildAuthPayload(data);
}

export async function getCurrentUserProfile() {
  const data = await apiRequest('/auth/me');
  return normalizeUserProfile(data?.user);
}

export async function updateMyProfile(profileInput) {
  const data = await apiRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(profileInput),
  });

  return {
    message: data?.message || '',
    user: normalizeUserProfile(data?.user),
  };
}
