import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

import InfoRow, { type InfoRowProps } from './InfoRow';

interface InfoCardProps {
  rows: Omit<InfoRowProps, 'showDivider'>[];
}

/** Rounded panel of label/value rows, with dividers between them. */
export default function InfoCard({ rows }: InfoCardProps) {
  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <InfoRow key={row.label} {...row} showDivider={index < rows.length - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
});
