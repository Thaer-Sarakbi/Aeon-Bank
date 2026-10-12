/**
 * Colour tokens from the Transfers design. The design uses oklch(), which
 * React Native doesn't support, so those values are pre-converted to hex.
 */
export const colors = {
  background: '#faf9f6',
  surface: '#ffffff',
  surfaceMuted: '#f2f0eb',
  pressed: '#f2f0eb',
  border: '#e3e0d9',

  text: '#1b1a18',
  textMuted: '#7a766e',
  textSubtle: '#9a968e',
  onPrimary: '#faf9f6',

  primary: '#1b1a18',
  accent: '#2f7a5e', // oklch(0.45 0.11 160)
  positive: '#2e7d55', // oklch(0.48 0.12 155)
  negative: '#b8423a', // oklch(0.52 0.16 25)

  shadow: '#000000',

  skeleton: '#e9e6e0',
  skeletonHighlight: '#f6f4f0',

  // oklch(0.9 0.05 h) for h = 160, 60, 260, 20, 210, 110
  avatarPalette: ['#cfeadb', '#f3dcc4', '#d9dff7', '#f6d6d8', '#c9e6ee', '#e2e6c3'],
} as const;
