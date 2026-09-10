import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const COOKIE_KEY = 'vaporbets.auth.cookie';

async function getCookie() {
  return SecureStore.getItemAsync(COOKIE_KEY);
}

//save cookie to local device
async function saveCookies(response) {
  //set-cookie header was set in register, login, and verify-email routes
  const cookies = response.headers.get('set-cookie');
  if (cookies) {
    await SecureStore.setItemAsync(COOKIE_KEY, cookies);
  }
}

//remove cookie from local device
export async function clearAuthCookie() {
  await SecureStore.deleteItemAsync(COOKIE_KEY);
}

//request function used in login/register form
export async function apiRequest(path, options = {}) {
  const cookie = await getCookie();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  await saveCookies(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return { data, response };
}