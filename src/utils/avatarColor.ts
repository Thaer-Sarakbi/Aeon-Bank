import { colors } from '@/theme/colors';

/** Stable pastel background per name, so the same person always gets the same colour. */
export function getAvatarColor(name: string): string {
  const palette = colors.avatarPalette;
  return palette[(name.charCodeAt(0) || 0) % palette.length];
}
