import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const CAPTURE_KEY = 'app';

/**
 * Blocks screenshots and screen recordings while mounted (Android FLAG_SECURE,
 * which also blanks the recent-apps preview; iOS 13+ capture protection) and
 * blurs the iOS app-switcher snapshot.
 */
export function useScreenCaptureProtection() {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    ScreenCapture.preventScreenCaptureAsync(CAPTURE_KEY).catch(() => {});
    if (Platform.OS === 'ios') {
      ScreenCapture.enableAppSwitcherProtectionAsync(1).catch(() => {});
    }

    return () => {
      ScreenCapture.allowScreenCaptureAsync(CAPTURE_KEY).catch(() => {});
      if (Platform.OS === 'ios') {
        ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => {});
      }
    };
  }, []);
}
