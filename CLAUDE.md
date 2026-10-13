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

Native projects were generated with `npx expo prebuild` (bundle id / Android package `com.thaer.aeon`). `ios/` and `android/` are gitignored CNG output: change native config via `app.json` and regenerate with `npx expo prebuild --clean` (they were last regenerated on 2026-10-13, after expo-router and jail-monkey were removed and the splash config changed). Both `yarn.lock` and `package-lock.json` exist, so prebuild is run with `--no-install` and then `pod install` in `ios/`. `npm run ios` / `npm run android` = `expo run:ios|android`.

Don't use `react-native-skeleton-placeholder` / `react-native-linear-gradient`: they are old-architecture-only (no Fabric component), and RN 0.86 is New-Architecture-only, so they crash with `View config not found for component BVLinearGradient`. Both were removed. Use RN's built-in `experimental_backgroundImage` CSS gradients instead (or `expo-linear-gradient` if a native gradient is ever needed).

**Runs in Expo Go** (`npx expo start`, scan the QR code with an SDK 57 Expo Go). Every native dependency is in the Expo Go SDK, so don't add third-party native modules (e.g. `jail-monkey` was removed for this reason) without first switching to a dev build (`expo-dev-client` + EAS).

Verification = `npx tsc --noEmit` + `npx expo lint` (ESLint flat config: `eslint.config.js`, `eslint-config-expo`) + `npx expo-doctor`. There is no test framework. The package manager is npm. The user's `~/.npm` cache has root-owned files, so if installs fail with EACCES, set `npm_config_cache` to a writable temp dir.

## Architecture (`src/`)

- `App.tsx`: `SafeAreaProvider` + `NavigationContainer` (theme built from `colors`) + `StatusBar`. It calls `useScreenCaptureProtection()`.
- `security/useScreenCaptureProtection.ts`: a hook called in `App` that blocks screenshots and screen recordings app-wide with `expo-screen-capture` (`preventScreenCaptureAsync('app')`: FLAG_SECURE on Android, which also blanks the recents preview; iOS 13+), and turns on iOS app-switcher blur (`enableAppSwitcherProtectionAsync(1)`). It is skipped on web. No screenshot listener is used, so no `READ_MEDIA_IMAGES` permission is needed.
- `navigation/RootNavigator.tsx`: native stack. `TransactionsList` (iOS large title "Transfers") → `TransactionDetails` (`{ refId }` param). Param types are in `types/navigation.ts` (`RootStackParamList`, `RootStackScreenProps<T>`).
- `store/useTransactionsStore.ts`: Zustand store `{ transactions, status: idle|loading|success|error, error, fetchTransactions }`, wrapped in `persist` (key `aeon.transactions`, only `transactions` is persisted). It sorts with `utils/sort.ts#sortByDateDesc` after fetching. `selectTransactionById(refId)` is the detail selector. Screens fetch on mount only when the status is `idle`. Status is not persisted, so the app still refetches on launch while showing the cached list. A custom `merge` stops a late hydration from overwriting a fresher fetch.
- `store/useAuthStore.ts`: Zustand store `{ token, status, error, fetchToken, clearToken }`, wrapped in `persist` (key `aeon.auth`, only `token` is persisted). `fetchToken` calls the mock auth API. `merge` won't overwrite a newer in-memory token. It is not wired into any screen yet.
- `store/secureStorage.ts`: `secureJSONStorage`, the zustand `persist` storage for both stores, backed by `expo-secure-store` (iOS Keychain service `com.thaer.aeon`, `WHEN_UNLOCKED_THIS_DEVICE_ONLY`; Android Keystore-backed encryption, excluded from Auto Backup). Persist keys may only use alphanumerics, `.`, `-` and `_`. Keep persisted slices small, because some iOS versions reject values above ~2 KB, and write failures are only `console.warn`ed in dev. `expo-secure-store` is a native module listed in `app.json` plugins, so it needs a prebuild or dev build.
- `components/`: reusable UI. `Avatar` (round initials picture, `size`), `TitleText`, `InfoText` (`mono` for ref IDs), `AmountText` (signed and coloured, `size` md|lg), `TransactionList` (the single reusable FlatList), `TransactionListItem` (card row), `InfoRow` + `InfoCard` (label/value rows), `PrimaryButton`, `StateView` (loading/empty/error), `TransactionDetailsSkeleton` (shimmer placeholder matching the details layout and shown by `TransactionDetailsScreen` while loading; each `Bone` is a clipped View with a Reanimated-translated `experimental_backgroundImage` linear-gradient sweep, so it needs no extra native deps).
- `screens/`: `TransactionsListScreen`, `TransactionDetailsScreen`.
- `utils/`: `format.ts` (amount, short/long `en-MY` dates, initials, `isIncoming`), `sort.ts`, `avatarColor.ts`.
- `theme/colors.ts`: **all colours live here**. Never hard-code a colour in a component. The design's oklch values are pre-converted to hex.
- `types/`: `Transaction`, navigation types.
- Imports use the `@/*` → `src/*` alias. React Compiler is on (`experiments.reactCompiler`), so manual `useMemo`/`useCallback` is unnecessary.
