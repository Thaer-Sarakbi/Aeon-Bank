import JailMonkey from 'jail-monkey';
import { Platform } from 'react-native';

export type IntegrityIssue = 'jailbroken' | 'hooked' | 'unverifiable';

export interface DeviceIntegrity {
  compromised: boolean;
  issues: IntegrityIssue[];
}

/** Dev-only switch: emulators often look rooted (test-keys), so checks are skipped in `__DEV__` unless enabled. */
export const deviceIntegrityConfig = {
  enforceInDev: false,
};

/**
 * Detects rooted (Android) / jailbroken (iOS) devices and hooking frameworks
 * such as Frida or Substrate via jail-monkey. Fails closed: if the native
 * module can't run, the device is treated as compromised.
 */
export function checkDeviceIntegrity(): DeviceIntegrity {
  if (Platform.OS === 'web' || (__DEV__ && !deviceIntegrityConfig.enforceInDev)) {
    return { compromised: false, issues: [] };
  }

  const issues: IntegrityIssue[] = [];
  try {
    if (JailMonkey.isJailBroken()) issues.push('jailbroken');
    if (JailMonkey.hookDetected()) issues.push('hooked');
  } catch {
    issues.push('unverifiable');
  }
  return { compromised: issues.length > 0, issues };
}
