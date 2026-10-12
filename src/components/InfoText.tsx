import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { colors } from '@/theme/colors';

interface InfoTextProps extends TextProps {
  /** Monospace, subtle style for reference IDs. */
  mono?: boolean;
}

/** Secondary, muted text (dates, labels, descriptions). */
export default function InfoText({ mono = false, style, ...rest }: InfoTextProps) {
  return <Text {...rest} style={[styles.info, mono && styles.mono, style]} />;
}

const styles = StyleSheet.create({
  info: {
    fontSize: 13,
    color: colors.textMuted,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: colors.textSubtle,
  },
});
