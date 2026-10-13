# Aeon — Secure Transfers App

A two-screen banking app built with **Expo SDK 57**, **React Native 0.86** (New Architecture), **React 19.2** and **TypeScript (strict)**. It lists a user's money transfers and shows each transfer's full details.

The project is built around **mobile security**: sensitive data is stored in the iOS Keychain / Android Keystore, screenshots and screen recordings are blocked, and the app won't run on rooted or jailbroken devices.

---

## Table of contents

1. [Features](#features)
2. [Security](#security)
   - [Secure token and data storage (Keychain / Keystore)](#1-secure-token-and-data-storage-keychain--keystore)
   - [Screenshot and screen-recording prevention](#2-screenshot-and-screen-recording-prevention)
   - [Root / jailbreak / hooking detection](#3-root--jailbreak--hooking-detection)
   - [Security summary](#security-summary)
3. [Architecture](#architecture)
4. [Data flow](#data-flow)
5. [Offline support](#offline-support)
6. [Project structure](#project-structure)
7. [Tech stack](#tech-stack)
8. [Getting started](#getting-started)
9. [Development notes](#development-notes)

---

## Features

### Transfers list (`TransactionsListScreen`)
- Transfer cards (avatar with initials, name, transfer title, date, signed amount), **sorted newest first**.
- **Pull to refresh**.
- Full state handling: **loading**, **empty** ("No transfers yet") and **error with Retry**.
- iOS large title "Transfers".

### Transfer details (`TransactionDetailsScreen`)
- Avatar, direction ("Received from…" / "Sent to…") and a large signed amount.
- Info card: **Reference ID** with a **Copy** button (`expo-clipboard`, shows "Copied" for 1.5 s), transfer date, Sender / Recipient and transfer name.
- **Share receipt** button (React Native `Share`).
- **Shimmer skeleton** while loading, built with Reanimated and RN's built-in `experimental_backgroundImage` CSS gradients, so it needs no extra native dependency.
- A "Transfer not found" state for an unknown reference.

### Direction and colour
Direction comes from the sign of the amount:

| Amount | Meaning | Display |
|---|---|---|
| `> 0` | Money received | Green, `+ RM 1,500.00` |
| `< 0` | Money sent | Red, `− RM 250.00` |

---

## Security

Security is the main focus of this project. There are three layers, and each one is described below with what it protects against, how it works, and where the code lives.

### 1. Secure token and data storage (Keychain / Keystore)

**File:** [`src/store/secureStorage.ts`](src/store/secureStorage.ts)

The app never uses `AsyncStorage` (plain, unencrypted files on disk). Every persisted Zustand store goes through `secureJSONStorage`, a custom `persist` storage adapter backed by **`expo-secure-store`**.

| Platform | Where the data lives | Protection |
|---|---|---|
| **iOS** | **Keychain** (service `com.thaer.aeon`) | `WHEN_UNLOCKED_THIS_DEVICE_ONLY`: the data can only be read while the device is unlocked, is **never synced to iCloud**, and is **never restored onto another device** from a backup. |
| **Android** | Encrypted SharedPreferences, with the encryption key held in the **Android Keystore** (hardware-backed where the device supports it) | The key can't be extracted from the device. The `expo-secure-store` config plugin **excludes this data from Android Auto Backup**. |

What is stored securely:

| Store | Persist key | Persisted fields |
|---|---|---|
| `useAuthStore` | `aeon.auth` | `token` (the bearer/auth token) |
| `useTransactionsStore` | `aeon.transactions` | `transactions` (the cached list, so it's available offline) |

Design decisions:
- **Only the minimum is persisted.** `partialize` keeps runtime fields such as `status` and `error` out of storage.
- **Keys are validated by the platform.** Secure Store keys may only contain alphanumerics, `.`, `-` and `_`.
- **Values are kept small.** Some iOS versions reject Keychain values above ~2 KB.
- **Failures are handled.** A failed read returns `null` (the app falls back to fetching), and a failed write is logged with `console.warn` in development only, so no data leaks into production logs.
- **Hydration can't override fresh state.** Each store has a custom `merge`, so a late read from secure storage never replaces a newer token or a fresher fetched list.
- `clearToken()` removes the token from memory **and** from the Keychain/Keystore (sign-out).

```ts
const SECURE_STORE_OPTIONS = {
  keychainService: 'com.thaer.aeon',
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};
```

### 2. Screenshot and screen-recording prevention

**File:** [`src/security/useScreenCaptureProtection.ts`](src/security/useScreenCaptureProtection.ts) (called once in `App.tsx`, so it covers the whole app)

Banking screens show names, amounts and reference IDs. The app stops this data from being captured with **`expo-screen-capture`**:

| Platform | What happens |
|---|---|
| **Android** | `preventScreenCaptureAsync('app')` sets **`FLAG_SECURE`** on the window. Screenshots and screen recordings come out black, and the **Recent Apps preview is blanked**, so data doesn't show in the task switcher. Casting to non-secure displays is blocked too. |
| **iOS (13+)** | Screen captures and recordings of the app's content are blocked. `enableAppSwitcherProtectionAsync(1)` **blurs the app-switcher snapshot**, so balances aren't visible when you swipe between apps. |
| **Web** | Skipped (not supported). |

No screenshot *listener* is used, so the app does **not** need the `READ_MEDIA_IMAGES` permission on Android.

### 3. Root / jailbreak / hooking detection

**File:** [`src/security/deviceIntegrity.ts`](src/security/deviceIntegrity.ts) (used by `App.tsx`)

On a rooted or jailbroken device, the OS sandbox can't be trusted: other apps or malware can read the Keychain/Keystore, change app memory, or bypass the protections above. The app checks the device with **`jail-monkey`** when it starts:

- `JailMonkey.isJailBroken()`: detects **root** on Android (su binaries, Magisk, test-keys builds, dangerous props, root-management apps) and **jailbreak** on iOS (Cydia/Sileo/Zebra, suspicious files and paths, sandbox write checks, URL schemes).
- `JailMonkey.hookDetected()`: detects **runtime hooking / instrumentation frameworks** such as **Frida** and **Cydia Substrate**, which attackers use to change app behaviour at runtime.

**How it is enforced**

```tsx
const [integrity] = useState(checkDeviceIntegrity); // runs once on launch

{integrity.compromised
  ? <StateView variant="error" title="Device not supported" ... />
  : <NavigationContainer>...</NavigationContainer>}
```

If the device is compromised, the navigation tree is **never mounted**. The user sees a "Device not supported" screen and can't reach any screen or any data.

**It fails closed.** If the native module throws or isn't linked (for example a broken build or a tampered binary), the result is `unverifiable` and the app is **blocked**, not allowed through.

**iOS URL schemes.** iOS jailbreak detection uses `canOpenURL` to look for jailbreak apps (`cydia://`, `sileo://`, `zbra://`, `filza://`, …). iOS only allows this for schemes declared in `Info.plist`, so `app.json` declares `ios.infoPlist.LSApplicationQueriesSchemes`, mirroring the `schemesToCheck` list in `jail-monkey`'s native code.

**Development behaviour.** Emulators and simulators often look rooted (test-keys), so the check is skipped in `__DEV__` and on web. To test it in development, set:

```ts
deviceIntegrityConfig.enforceInDev = true; // src/security/deviceIntegrity.ts
```

### Security summary

| Threat | Mitigation | Where |
|---|---|---|
| Token / data stolen from the file system or a backup | Keychain (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`) / Keystore encryption, excluded from backups | `store/secureStorage.ts` |
| Data restored onto another device | `THIS_DEVICE_ONLY` accessibility, Android Auto Backup exclusion | `store/secureStorage.ts`, `app.json` plugin |
| Screenshots / screen recordings / screen sharing | `FLAG_SECURE` (Android), iOS capture protection | `security/useScreenCaptureProtection.ts` |
| Sensitive data in the app switcher | Blank recents (Android), blurred snapshot (iOS) | `security/useScreenCaptureProtection.ts` |
| Rooted / jailbroken device | `jail-monkey` check, app blocked before navigation mounts | `security/deviceIntegrity.ts`, `App.tsx` |
| Frida / Substrate runtime hooking | `hookDetected()`, app blocked | `security/deviceIntegrity.ts` |
| Detection module missing or tampered | Fails closed (`unverifiable` → blocked) | `security/deviceIntegrity.ts` |
| Sensitive data in production logs | Storage warnings only in `__DEV__` | `store/secureStorage.ts` |

> **Production note:** the backend is mocked. With a real API you should also add TLS **certificate pinning**, short-lived access tokens with refresh, server-side session revocation, and code obfuscation/hardening (e.g. R8/ProGuard on Android). Client-side root detection can be bypassed by a determined attacker, so treat it as one layer of defence and back it with server-side checks (e.g. Play Integrity / App Attest).

---

## Architecture

The app uses a layered architecture with one-way data flow:

```
┌──────────────────────────────────────────────────────────────┐
│ App.tsx                                                      │
│  • SafeAreaProvider                                          │
│  • useScreenCaptureProtection()   ← security layer           │
│  • checkDeviceIntegrity() gate    ← security layer           │
│  • NavigationContainer (theme from theme/colors.ts)          │
└───────────────┬──────────────────────────────────────────────┘
                │
┌───────────────▼──────────────┐
│ Navigation (React Navigation │  RootNavigator: native stack
│ 7, native stack)             │  TransactionsList → TransactionDetails { refId }
└───────────────┬──────────────┘
                │
┌───────────────▼──────────────┐
│ Screens                      │  Read state with selectors, trigger actions,
│                              │  render loading / empty / error / content
└───────────────┬──────────────┘
                │ uses
┌───────────────▼──────────────┐       ┌────────────────────────────┐
│ Components (presentational)  │       │ Stores (Zustand + persist) │
│ Avatar, AmountText, InfoCard │       │ useTransactionsStore       │
│ TransactionList, StateView…  │       │ useAuthStore               │
└──────────────────────────────┘       └──────┬──────────────┬──────┘
                                              │              │
                                 ┌────────────▼───┐   ┌──────▼──────────────┐
                                 │ API layer      │   │ secureStorage       │
                                 │ (mocked)       │   │ Keychain / Keystore │
                                 └────────────────┘   └─────────────────────┘
```

**Key decisions**

- **React Navigation 7 (native stack)**, not Expo Router. The entry point is `index.ts` → `registerRootComponent(App)`. Screens use real native navigation controllers (`react-native-screens`).
- **Zustand** for state: small, no boilerplate, selector-based subscriptions (components only re-render when the slice they read changes), and built-in `persist` middleware.
- **API layer separated from state.** Screens never call the API directly; they call store actions. Moving to a real backend only means changing `src/api/*`.
- **Presentational components** are reusable and stateless (`Avatar`, `AmountText`, `InfoRow`/`InfoCard`, `PrimaryButton`, `StateView`, …). One reusable `TransactionList` (FlatList) is used for the list.
- **Centralised theming.** All colours are in `theme/colors.ts` and spacing is in `theme/spacing.ts`, exposed through `useAppTheme()`. No colour is hard-coded in a component.
- **React Compiler** is on (`experiments.reactCompiler`), so manual `useMemo` / `useCallback` aren't needed.
- **Strict TypeScript** with typed navigation params (`RootStackParamList`, `RootStackScreenProps<T>`) and the `@/*` → `src/*` path alias.
- **Continuous Native Generation (CNG).** `ios/` and `android/` are generated from `app.json` + config plugins and are gitignored, so they're never edited by hand.

---

## Data flow

### Loading the list

```
TransactionsListScreen mounts
        │
        ├─ status === 'idle' ? ──► store.fetchTransactions()
        │                              │
        │                              ├─ set({ status: 'loading' })
        │                              ├─ api.fetchTransactions()  (~800 ms mock latency)
        │                              ├─ sortByDateDesc(result)
        │                              └─ set({ transactions, status: 'success' })
        │                                     │                       or
        │                                     │            set({ status: 'error', error })
        │                                     ▼
        │                         persist middleware → secureJSONStorage
        │                         → Keychain / Keystore ("aeon.transactions")
        ▼
Screen re-renders through selectors:
  loading (no cached data) → spinner
  error                    → error view + Retry
  success, empty           → "No transfers yet"
  success                  → TransactionList (pull-to-refresh calls fetchTransactions again)
```

### Opening details

```
Tap a card → navigation.navigate('TransactionDetails', { refId })
        │
        ▼
TransactionDetailsScreen
  useTransactionsStore(selectTransactionById(refId))   ← read from the store, no new request
  → skeleton → details card / "Transfer not found"
```

Only the `refId` is passed through navigation. The screen reads the full transaction from the store, so there is a single source of truth and no sensitive data in navigation params.

### Auth token

```
useAuthStore.fetchToken() → api.fetchAuthToken() (~500 ms mock)
  → set({ token }) → persist → Keychain / Keystore ("aeon.auth")
useAuthStore.clearToken() → token removed from memory and secure storage
```

On launch, `persist` rehydrates the token from secure storage. The custom `merge` never overwrites a newer in-memory token. (The auth store is ready but isn't wired into a screen yet.)

---

## Offline support

The transfers list is cached in **encrypted secure storage**, so the app works without a network:

1. **On launch**, `persist` rehydrates the last fetched `transactions` from the Keychain/Keystore, and the list is shown **straight away**, without a loading spinner.
2. `status` is **not** persisted, so it starts as `idle` and the screen **still refetches** in the background to get fresh data (stale-while-revalidate).
3. **If the network request fails**, the error state with **Retry** is shown, and pull-to-refresh lets the user try again when the connection comes back.
4. **Details work offline**: `TransactionDetailsScreen` reads from the cached store, so any cached transfer can be opened without a network.
5. **Race safety**: if the fresh fetch finishes before hydration, the custom `merge` keeps the fresh list and ignores the older cached one.

Because the cache is in the Keychain/Keystore and not in plain `AsyncStorage`, offline data gets the same protection as the auth token.

---

## Project structure

```
Aeon-Bank/
├── index.ts                     # Entry: registerRootComponent(App)
├── app.json                     # Expo config: bundle IDs, plugins, iOS LSApplicationQueriesSchemes, splash
├── package.json
├── tsconfig.json                # strict TS + "@/*" → "src/*" alias
├── eslint.config.js             # ESLint flat config (eslint-config-expo)
├── assets/                      # App icons, splash image (assets/icons/aeon.png)
├── ios/, android/               # Generated by `expo prebuild` (gitignored, never edited by hand)
└── src/
    ├── App.tsx                  # Providers, security gate, navigation container
    ├── api/
    │   ├── response.ts          # Static mock transfer data
    │   ├── transactionsApi.ts   # fetchTransactions() — mock GET /transactions (~800 ms)
    │   └── authApi.ts           # fetchAuthToken() — mock POST /auth/token (~500 ms)
    ├── security/
    │   ├── deviceIntegrity.ts           # Root / jailbreak / hook detection (jail-monkey)
    │   └── useScreenCaptureProtection.ts # Screenshot / recording block, app-switcher blur
    ├── store/
    │   ├── secureStorage.ts     # Zustand persist adapter → expo-secure-store
    │   ├── useTransactionsStore.ts # Transfers state, fetch, cache, selectors
    │   └── useAuthStore.ts      # Auth token state, persisted securely
    ├── navigation/
    │   └── RootNavigator.tsx    # Native stack: TransactionsList → TransactionDetails
    ├── screens/
    │   ├── TransactionsListScreen.tsx
    │   └── TransactionDetailsScreen.tsx
    ├── components/
    │   ├── Avatar.tsx           # Round initials avatar with a colour derived from the name
    │   ├── AmountText.tsx       # Signed, coloured amount (md | lg)
    │   ├── TitleText.tsx, InfoText.tsx  # Typography (InfoText has a `mono` variant for IDs)
    │   ├── TransactionList.tsx  # The reusable FlatList
    │   ├── TransactionListItem.tsx # Transfer card row
    │   ├── InfoRow.tsx, InfoCard.tsx # Label/value rows in a card
    │   ├── CopyButton.tsx       # "Copy" pill → expo-clipboard
    │   ├── PrimaryButton.tsx
    │   ├── StateView.tsx        # Loading / empty / error (+ Retry)
    │   └── TransactionDetailsSkeleton.tsx # Shimmer placeholder
    ├── theme/
    │   ├── colors.ts            # All colours (design oklch values converted to hex)
    │   ├── spacing.ts           # Spacing scale
    │   └── useAppTheme.ts       # { colors, SPACING }
    ├── types/
    │   ├── transaction.ts       # Transaction model
    │   └── navigation.ts        # RootStackParamList, RootStackScreenProps
    └── utils/
        ├── format.ts            # Amount, en-MY dates, initials, isIncoming
        ├── sort.ts              # sortByDateDesc
        └── avatarColor.ts       # Stable colour per name
```

### Data model

```ts
interface Transaction {
  refId: string;          // e.g. "123ABC"
  transferDate: string;   // ISO 8601, UTC
  recipientName: string;
  transferName: string;
  amount: number;         // > 0 received, < 0 sent
}
```

---

## Tech stack

| Area | Library |
|---|---|
| Framework | Expo SDK 57, React Native 0.86 (New Architecture), React 19.2 |
| Language | TypeScript (strict) |
| Navigation | `@react-navigation/native` 7 + `native-stack`, `react-native-screens` |
| State | `zustand` 5 + `persist` middleware |
| Secure storage | `expo-secure-store` (Keychain / Keystore) |
| Screen protection | `expo-screen-capture` |
| Root / jailbreak detection | `jail-monkey` |
| Animation | `react-native-reanimated` 4 (skeleton shimmer) |
| Utilities | `expo-clipboard`, RN `Share`, `react-native-safe-area-context` |
| Tooling | ESLint (`eslint-config-expo`), React Compiler |

---

## Getting started

### Requirements
- Node.js LTS and npm
- Xcode (iOS) and/or Android Studio (Android)
- CocoaPods (iOS)

### Install and run

```bash
npm install

# Generate the native projects (CNG) — only needed the first time or after app.json changes
npx expo prebuild --clean --no-install
cd ios && pod install && cd ..

npm run ios       # expo run:ios
npm run android   # expo run:android
```

> **A development build is required — Expo Go won't work.** `jail-monkey` is a third-party native module that Expo Go doesn't include. In a release build without it, the integrity check fails closed and blocks the app. You can also use an EAS development build: `npx eas-cli@latest build --profile development`.

### Verify

```bash
npx tsc --noEmit   # type check
npx expo lint      # lint
npx expo-doctor    # dependency / config check
```

There is no test framework yet.

---

## Development notes

### Testing the UI states
In [`src/api/transactionsApi.ts`](src/api/transactionsApi.ts):

```ts
mockApiConfig.shouldFail = true;   // error state + Retry
mockApiConfig.returnEmpty = true;  // empty state
```

In [`src/api/authApi.ts`](src/api/authApi.ts): `mockAuthConfig.shouldFail = true`.

### Testing security features
- **Root / jailbreak blocking:** set `deviceIntegrityConfig.enforceInDev = true`, then run on a rooted emulator (most stock emulators count) to see the "Device not supported" screen.
- **Screenshot blocking:** take a screenshot on a real device. On Android it comes out black; on iOS, open the app switcher to see the blurred snapshot.
- **Secure storage:** fetch the list, kill the app, turn on airplane mode and relaunch. The cached list comes back from the Keychain/Keystore.

### Native configuration
Native settings live in `app.json` (bundle ID / package `com.thaer.aeon`, splash `assets/icons/aeon.png` on `#ef23b8`, `expo-secure-store` plugin, iOS query schemes). After changing them, regenerate with `npx expo prebuild --clean --no-install` and then run `pod install`.

### Things to avoid
- `react-native-skeleton-placeholder` / `react-native-linear-gradient`: old-architecture only, so they crash on RN 0.86 (`View config not found for component BVLinearGradient`). Use `experimental_backgroundImage` gradients or `expo-linear-gradient` instead.
- `AsyncStorage` for anything sensitive: use `secureJSONStorage`.
- Hard-coded colours: add them to `theme/colors.ts`.
- Always add packages with `npx expo install <pkg>` so the versions match the SDK.
