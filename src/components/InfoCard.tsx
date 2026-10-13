import { StyleSheet, View } from 'react-native';


import { SPACING } from '@/theme/spacing';
import { useAppTheme } from '@/theme/useAppTheme';
import InfoRow, { type InfoRowProps } from './InfoRow';

interface InfoCardProps {
  rows: Omit<InfoRowProps, 'showDivider'>[];
}

/** Rounded panel of label/value rows, with dividers between them. */
export default function InfoCard({ rows }: InfoCardProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);

  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <InfoRow key={row.label} {...row} showDivider={index < rows.length - 1} />
      ))}
    </View>
  );
}

const createStyles = (
    colors: ReturnType<typeof useAppTheme>['colors'],
    space: ReturnType<typeof useAppTheme>['SPACING']
  ) => StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: space.space_4,
    paddingHorizontal: space.space_16,
  },
});
