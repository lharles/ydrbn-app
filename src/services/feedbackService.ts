const FORM_ENDPOINT =
  'https://docs.google.com/forms/d/e/1FAIpQLSexZMDE-rpOhyHfHyr4WjqYcd8Lju6yDMeeFwo6snzrVzZuNg/formResponse';

const ENTRY_CATEGORY = 'entry.1684451577';
const ENTRY_CONTENT = 'entry.530337516';
const ENTRY_VERSION = 'entry.1547053940';
const ENTRY_DEVICE_ID = 'entry.2002752014';

const COOLDOWN_MS = 3 * 60 * 1000; // 3-minute cooldown between dispatches

/**
 * Retrieves or initializes an anonymous, non-identifying installation UUID.
 */
export function getAnonymousDeviceId(): string {
  if (typeof window === 'undefined') return 'unknown-device';
  let id = localStorage.getItem('ydrbn_device_uuid');
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'dev-' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('ydrbn_device_uuid', id);
  }
  return id;
}

export interface DispatchResult {
  success: boolean;
  message: string;
}

/**
 * Sends feedback silently in the background using no-cors fetch.
 */
export async function transmitDispatch(
  category: string,
  content: string,
  appVersion: string = 'v1.0.0'
): Promise<DispatchResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      message: 'Network offline. Please connect to transmit your dispatch.',
    };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { success: false, message: 'Dispatch content cannot be blank.' };
  }

  if (trimmed.length > 500) {
    return {
      success: false,
      message: 'Dispatch exceeds maximum limit of 500 characters.',
    };
  }

  // Throttling check
  const lastSent = parseInt(localStorage.getItem('ydrbn_last_dispatch') || '0', 10);
  const now = Date.now();
  if (now - lastSent < COOLDOWN_MS) {
    const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
    return {
      success: false,
      message: `Transmission throttle active. Please wait ${remainingSec}s.`,
    };
  }

  const deviceId = getAnonymousDeviceId();

  const formData = new URLSearchParams();
  formData.append(ENTRY_CATEGORY, category);
  formData.append(ENTRY_CONTENT, trimmed);
  formData.append(ENTRY_VERSION, appVersion);
  formData.append(ENTRY_DEVICE_ID, deviceId);

  try {
    await fetch(FORM_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    localStorage.setItem('ydrbn_last_dispatch', now.toString());
    return {
      success: true,
      message: 'Dispatch transmitted successfully to the archive.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Transmission failed: ${error?.message || 'Check network'}`,
    };
  }
}