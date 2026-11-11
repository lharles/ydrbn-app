declare const __YDRBN_BUILD_ID__: string;

export const CURRENT_BUILD_ID: string =
  typeof __YDRBN_BUILD_ID__ !== 'undefined' ? __YDRBN_BUILD_ID__ : 'dev';

export interface AppUpdateCheckResult {
  hasAppUpdate: boolean;
  offline: boolean;
  remoteVersion?: string;
  remoteBuildId?: string;
}

export async function checkForAppUpdate(): Promise<AppUpdateCheckResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { hasAppUpdate: false, offline: true };
  }

  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update().catch(() => {});
      }
    }
  } catch {
    // ignore SW update check error
  }

  try {
    const base = (import.meta.env.BASE_URL || '/').endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const res = await fetch(`${base}version.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return { hasAppUpdate: false, offline: false };
    }
    const data = await res.json();
    if (data?.offline) {
      return { hasAppUpdate: false, offline: true };
    }

    const hasAppUpdate =
      CURRENT_BUILD_ID !== 'dev' &&
      Boolean(data?.buildId) &&
      String(data.buildId) !== String(CURRENT_BUILD_ID);

    return {
      hasAppUpdate,
      offline: false,
      remoteVersion: data?.version,
      remoteBuildId: data?.buildId,
    };
  } catch {
    return { hasAppUpdate: false, offline: !navigator.onLine };
  }
}
