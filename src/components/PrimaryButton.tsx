import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { SPACING } from '@/theme/spacing';
import { useAppTheme } from '@/theme/useAppTheme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function PrimaryButton({ title, onPress, style }: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}>
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  spacing: ReturnType<typeof useAppTheme>['SPACING']
) => StyleSheet.create({
  button: {
    height: spacing.space_52,
    borderRadius: 26,
    paddingHorizontal: spacing.space_28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
  },
});
