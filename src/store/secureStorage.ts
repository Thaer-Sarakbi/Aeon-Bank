import * as SecureStore from 'expo-secure-store';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * iOS: stored in the Keychain, readable only while the device is unlocked and
 * never synced to iCloud or restored onto another device.
 * Android: encrypted with a key held in the Android Keystore; the plugin's
 * default `configureAndroidBackup` keeps it out of Auto Backup.
 */
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'com.thaer.aeon',
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * `StateStorage` for zustand's `persist` backed by expo-secure-store.
 * Keys may only contain alphanumerics, `.`, `-` and `_`. Keep values small:
 * some iOS releases reject values above ~2 KB.
 */
const secureStateStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return await SecureStore.getItemAsync(name, SECURE_STORE_OPTIONS);
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await SecureStore.setItemAsync(name, value, SECURE_STORE_OPTIONS);
    } catch (e) {
      if (__DEV__) console.warn(`[secureStorage] failed to persist "${name}"`, e);
    }
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name, SECURE_STORE_OPTIONS).catch(() => {});
  },
};

export const secureJSONStorage = createJSONStorage(() => secureStateStorage);
