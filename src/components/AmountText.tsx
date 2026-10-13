import { StyleSheet, Text, type TextProps } from 'react-native';

import { SPACING } from '@/theme/spacing';
import { useAppTheme } from '@/theme/useAppTheme';
import { formatAmount, isIncoming } from '@/utils/format';

interface AmountTextProps extends Omit<TextProps, 'children'> {
  amount: number;
  size?: 'md' | 'lg';
}

/** Signed currency amount: green when received, red when sent. */
export default function AmountText({ amount, size = 'md', style, ...rest }: AmountTextProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);
  
  return (
    <Text
      numberOfLines={1}
      {...rest}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { color: isIncoming(amount) ? colors.positive : colors.negative },
        style,
      ]}>
      {formatAmount(amount)}
    </Text>
  );
}

const createStyles = (
    colors: ReturnType<typeof useAppTheme>['colors'],
    spacing: ReturnType<typeof useAppTheme>['SPACING']
  ) =>
  StyleSheet.create({
    base: {
      fontWeight: '600',
      fontVariant: ['tabular-nums'],
    },
    md: {
      fontSize: 15,
    },
    lg: {
      fontSize: 38,
      letterSpacing: -0.76,
    },
});