import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';


import { SPACING } from '@/theme/spacing';
import { useAppTheme } from '@/theme/useAppTheme';
import InfoText from './InfoText';

export interface InfoRowProps {
  label: string;
  value: ReactNode;
  showDivider?: boolean;
}

/** Label on the left, value on the right. A string value is rendered as text. */
export default function InfoRow({ label, value, showDivider = true }: InfoRowProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);

  return (
    <View style={[styles.row, showDivider && styles.divider]}>
      <InfoText style={styles.label}>{label}</InfoText>
      {typeof value === 'string' ? <Text style={styles.value}>{value}</Text> : value}
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  spacing: ReturnType<typeof useAppTheme>['SPACING']
) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.space_12,
    paddingVertical: spacing.space_12,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
  },
  value: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    color: colors.text,
  },
});
