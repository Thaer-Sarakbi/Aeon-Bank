import { ScrollView, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { colors } from '@/theme/colors';

const INFO_ROWS = [
  { label: 84, value: 96 },
  { label: 92, value: 150 },
  { label: 70, value: 110 },
  { label: 98, value: 124 },
];

/** Shimmering placeholder that mirrors the TransactionDetails layout while data is fetched. */
export default function TransactionDetailsSkeleton() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      scrollEnabled={false}
      accessibilityLabel="Loading transfer details">
      <SkeletonPlaceholder
        backgroundColor={colors.skeleton}
        highlightColor={colors.skeletonHighlight}
        borderRadius={6}>
        <SkeletonPlaceholder.Item>
          {/* Header: avatar, direction, amount, transfer name */}
          <SkeletonPlaceholder.Item alignItems="center" gap={8} paddingTop={12} paddingBottom={24}>
            <SkeletonPlaceholder.Item width={64} height={64} borderRadius={32} />
            <SkeletonPlaceholder.Item width={160} height={15} marginTop={4} />
            <SkeletonPlaceholder.Item width={190} height={38} borderRadius={8} />
            <SkeletonPlaceholder.Item width={120} height={15} />
          </SkeletonPlaceholder.Item>

          {/* Info card */}
          <SkeletonPlaceholder.Item borderRadius={18} paddingVertical={4} paddingHorizontal={16}>
            {INFO_ROWS.map((row, index) => (
              <SkeletonPlaceholder.Item
                key={index}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingVertical={14}>
                <SkeletonPlaceholder.Item width={row.label} height={14} />
                <SkeletonPlaceholder.Item width={row.value} height={14} />
              </SkeletonPlaceholder.Item>
            ))}
          </SkeletonPlaceholder.Item>

          {/* Share button */}
          <SkeletonPlaceholder.Item height={52} borderRadius={26} marginTop={20} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
});
