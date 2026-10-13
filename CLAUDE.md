## Instructions for Claude Code

After completing any task, feature, or file change in this project, 
automatically update this CLAUDE.md file to reflect what was built. 
Do this without being asked. Never end a session without syncing 
this file to the current state of the project.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

A two-screen banking transfers app (Expo SDK 57, React Native 0.86, React 19.2, TypeScript strict), styled after the `Transfers.dc.html` design:
- **TransactionsList**: transfer cards sorted newest first, pull-to-refresh, with loading, empty and error/retry states.
- **TransactionDetails**: avatar, direction, large amount, an info card (Reference ID, date, Sender/Recipient, transfer name) and a "Share receipt" button that uses RN `Share`.

Data comes from a mocked backend: `src/api/response.ts` holds the static `data` list, and `src/api/transactionsApi.ts` (`fetchTransactions`) wraps it with ~800ms latency. `mockApiConfig.shouldFail` / `returnEmpty` force the error and empty states. `src/api/authApi.ts` (`fetchAuthToken`) returns a random mock bearer token after ~500ms (`mockAuthConfig.shouldFail` forces an error). Direction is derived from the amount's sign: positive means received (green, `+ RM`), negative means sent (red, `− RM`).

**Navigation is React Navigation 7 (native stack), not expo-router.** expo-router was removed: the entry is `index.ts` → `registerRootComponent(App)` (`package.json` `"main": "index.ts"`), `typedRoutes` is off, and `web.output` is `"single"`.

Native projects were generated with `npx expo prebuild` (bundle id / Android package `com.thaer.aeon`). `ios/` and `android/` are gitignored CNG output: change native config via `app.json` and regenerate with `npx expo prebuild --clean`. Do this now, because the expo-router plugin was removed after the last prebuild. `npm run ios` / `npm run android` = `expo run:ios|android`.

`react-native-skeleton-placeholder` needs the native peers `react-native-linear-gradient` and `@react-native-masked-view/masked-view`, so it needs a dev build (not Expo Go). Its `masked-view ^0.2.8` peer conflicts with SDK 57's `0.3.2`, which is resolved by an `overrides` entry in `package.json`; keep that entry.

Verification = `npx tsc --noEmit` + `npx expo lint` (ESLint flat config: `eslint.config.js`, `eslint-config-expo`) + `npx expo-doctor`. There is no test framework. The package manager is npm. The user's `~/.npm` cache has root-owned files, so if installs fail with EACCES, set `npm_config_cache` to a writable temp dir.

## Architecture (`src/`)

- `App.tsx`: `SafeAreaProvider` + `NavigationContainer` (theme built from `colors`) + `StatusBar`. It calls `useScreenCaptureProtection()`, runs `checkDeviceIntegrity()` once on mount, and renders a blocking "Device not supported" `StateView` instead of the navigator when the device is compromised.
- `security/useScreenCaptureProtection.ts`: a hook called in `App` that blocks screenshots and screen recordings app-wide with `expo-screen-capture` (`preventScreenCaptureAsync('app')`: FLAG_SECURE on Android, which also blanks the recents preview; iOS 13+), and turns on iOS app-switcher blur (`enableAppSwitcherProtectionAsync(1)`). It is skipped on web. No screenshot listener is used, so no `READ_MEDIA_IMAGES` permission is needed.
- `security/deviceIntegrity.ts`: `checkDeviceIntegrity()` → `{ compromised, issues }` using `jail-monkey` (`isJailBroken` for root/jailbreak, `hookDetected` for Frida/Substrate). It fails closed: if the native module throws, the issue is `unverifiable` and the device counts as compromised. It is skipped on web and in `__DEV__` unless `deviceIntegrityConfig.enforceInDev` is set, because emulators often look rooted. `jail-monkey` is native (autolinked, no config plugin), so it needs a dev build.
- `navigation/RootNavigator.tsx`: native stack. `TransactionsList` (iOS large title "Transfers") → `TransactionDetails` (`{ refId }` param). Param types are in `types/navigation.ts` (`RootStackParamList`, `RootStackScreenProps<T>`).
- `store/useTransactionsStore.ts`: Zustand store `{ transactions, status: idle|loading|success|error, error, fetchTransactions }`, wrapped in `persist` (key `aeon.transactions`, only `transactions` is persisted). It sorts with `utils/sort.ts#sortByDateDesc` after fetching. `selectTransactionById(refId)` is the detail selector. Screens fetch on mount only when the status is `idle`. Status is not persisted, so the app still refetches on launch while showing the cached list. A custom `merge` stops a late hydration from overwriting a fresher fetch.
- `store/useAuthStore.ts`: Zustand store `{ token, status, error, fetchToken, clearToken }`, wrapped in `persist` (key `aeon.auth`, only `token` is persisted). `fetchToken` refuses on a compromised device (it sets `token: null`, which persist writes through), otherwise it calls the mock auth API. `merge` won't restore a token on a compromised device. It is not wired into any screen yet.
- `store/secureStorage.ts`: `secureJSONStorage`, the zustand `persist` storage for both stores, backed by `expo-secure-store` (iOS Keychain service `com.thaer.aeon`, `WHEN_UNLOCKED_THIS_DEVICE_ONLY`; Android Keystore-backed encryption, excluded from Auto Backup). Persist keys may only use alphanumerics, `.`, `-` and `_`. Keep persisted slices small, because some iOS versions reject values above ~2 KB, and write failures are only `console.warn`ed in dev. `expo-secure-store` is a native module listed in `app.json` plugins, so it needs a prebuild or dev build.
- `components/`: reusable UI. `Avatar` (round initials picture, `size`), `TitleText`, `InfoText` (`mono` for ref IDs), `AmountText` (signed and coloured, `size` md|lg), `TransactionList` (the single reusable FlatList), `TransactionListItem` (card row), `InfoRow` + `InfoCard` (label/value rows), `PrimaryButton`, `StateView` (loading/empty/error), `TransactionDetailsSkeleton` (shimmer placeholder matching the details layout, built with `react-native-skeleton-placeholder`; not wired into any screen yet).
- `screens/`: `TransactionsListScreen`, `TransactionDetailsScreen`.
- `utils/`: `format.ts` (amount, short/long `en-MY` dates, initials, `isIncoming`), `sort.ts`, `avatarColor.ts`.
- `theme/colors.ts`: **all colours live here**. Never hard-code a colour in a component. The design's oklch values are pre-converted to hex.
- `types/`: `Transaction`, navigation types.
- Imports use the `@/*` → `src/*` alias. React Compiler is on (`experiments.reactCompiler`), so manual `useMemo`/`useCallback` is unnecessary.
