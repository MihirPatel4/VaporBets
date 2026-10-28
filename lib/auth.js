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

export function subscribeToLiveUpdates(onUpdate, onStatusChange, onConnected) {
  let isActive = true;
  let socket = null;
  let reconnectTimer = null;
  let stableConnectionTimer = null;
  let reconnectAttempt = 0;

  //helper to retry connection
  const scheduleReconnect = () => {
    if (!isActive || reconnectTimer) {
      return;
    }

    //increasing delay to prevent frequent tries, capped at 30 seconds
    const delay = Math.min(1000 * (2 ** reconnectAttempt), 30000);
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  };

  //helper to establish connection
  const connect = async () => {
    try {
      const { data } = await apiRequest('/auth/websocket-ticket', { method: 'POST' });

      if (!isActive) {
        return;
      }

      //build the URL to use to open the connection
      const url = new URL(API_BASE_URL);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      url.pathname = '/live';
      url.search = '';
      url.searchParams.set('ticket', data.ticket);

      //start the connection
      const nextSocket = new WebSocket(url.toString());
      socket = nextSocket;
      let isSyncing = false;
      const pendingUpdates = [];

      //runs when connection opens
      nextSocket.onopen = () => {
        clearTimeout(stableConnectionTimer);
        //reconnect counter is reset if the connection is stable for 30 seconds
        stableConnectionTimer = setTimeout(() => { reconnectAttempt = 0 }, 30000);
        //clear any errors
        onStatusChange(null);
        isSyncing = true;

        //run onConnected
        Promise.resolve(onConnected()).catch(onStatusChange).finally(() => {
          if (!isActive || socket !== nextSocket) {
            return;
          }

          isSyncing = false;
          //applied queued updates
          pendingUpdates.forEach(onUpdate);
          pendingUpdates.length = 0;
        });
      };

      //runs when the WebSocket receives a message
      nextSocket.onmessage = ({ data: message }) => {
        try {
          const update = JSON.parse(message);
          const probability = Number(update.probability);
          if (update.type === 'outcome.updated' && update.eventId != null && update.outcomeId != null && Number.isFinite(probability) && probability >= 0 && probability <= 1) {
            const validatedUpdate = { ...update, probability };
            //add to queued updates list if still syncing, else pass to onUpdate
            if (isSyncing) {
              pendingUpdates.push(validatedUpdate);
            } else {
              onUpdate(validatedUpdate);
            }
          }
        } 
        catch {
          onStatusChange(new Error('Received an invalid live-update message.'));
        }
      };

      //close WebSocket when error
      nextSocket.onerror = () => nextSocket.close();
      //runs when WebSocket closes
      nextSocket.onclose = () => {
        if (socket === nextSocket) {
          socket = null;
          clearTimeout(stableConnectionTimer);
          if (isActive) {
            onStatusChange(new Error('Live connection lost. Reconnecting...'));
            scheduleReconnect();
          }
        }
      };
    } 
    catch (error) {
      if (!isActive) {
        return;
      }

      onStatusChange(error);

      //retry if the session is missing or invalid
      if (error.status !== 401) {
        scheduleReconnect();
      }
    }
  };

  connect();

  return () => {
    isActive = false;
    clearTimeout(reconnectTimer);
    clearTimeout(stableConnectionTimer);
    reconnectTimer = null;
    socket?.close();
    socket = null;
  };
}