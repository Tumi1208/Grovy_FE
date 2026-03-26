import { API_BASE_URL } from '../config/api';

async function parseResponse(response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error('The server returned an invalid response.');
  }
}

export async function apiRequest(path, options = {}) {
  const { headers, ...restOptions } = options;
  const url = `${API_BASE_URL}${path}`;
  let response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      ...restOptions,
    });
  } catch (error) {
    throw new Error(
      `Could not reach the Grovy backend at ${API_BASE_URL}. Make sure the Express server is running and keep Android emulator traffic pointed at 10.0.2.2.`,
    );
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || 'The request failed.');
  }

  return data;
}
