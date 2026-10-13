import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { SPACING } from '@/theme/spacing';
import { useAppTheme } from '@/theme/useAppTheme';

interface CopyButtonProps {
  /** Text written to the clipboard on press. */
  value: string;
  accessibilityLabel?: string;
}

/** Small "Copy" pill that copies `value` to the clipboard and shows "Copied" briefly. */
export default function CopyButton({ value, accessibilityLabel = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(value);
      setCopied(true);
    } catch {
      Alert.alert('Unable to copy', 'Please try again.');
    }
  };

  return (
    <Pressable
      onPress={copy}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.label}>{copied ? 'Copied' : 'Copy'}</Text>
    </Pressable>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  spacing: ReturnType<typeof useAppTheme>['SPACING']
) =>
  StyleSheet.create({
    button: {
      paddingHorizontal: spacing.space_8,
      paddingVertical: spacing.space_4,
      borderRadius: 999,
      backgroundColor: colors.surfaceMuted,
    },
    pressed: {
      backgroundColor: colors.border,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accent,
    },
  });
