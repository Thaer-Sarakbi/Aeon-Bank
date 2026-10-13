import { useEffect } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { useAppTheme } from '@/theme/useAppTheme';

const INFO_ROWS = [
  { label: 84, value: 96 },
  { label: 92, value: 150 },
  { label: 70, value: 110 },
  { label: 98, value: 124 },
];

const SHIMMER_GRADIENT = `linear-gradient(90deg, ${colors.skeleton}, ${colors.skeletonHighlight}, ${colors.skeleton})`;

type BoneProps = {
  progress: SharedValue<number>;
  width?: ViewStyle['width'];
  height: number;
  radius?: number;
  style?: ViewStyle;
};

/** A single placeholder block with a highlight sweeping across it. */
function Bone({ progress, width, height, radius = 6, style }: BoneProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -screenWidth + progress.value * screenWidth * 2 }],
  }));

  return (
    <View style={[styles.bone, { width, height, borderRadius: radius }, style]}>
      <Animated.View style={[styles.shimmer, { width: screenWidth }, shimmerStyle]} />
    </View>
  );
}

/** Shimmering placeholder that mirrors the TransactionDetails layout while data is fetched. */
export default function TransactionDetailsSkeleton() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
    );
  }, [progress]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      scrollEnabled={false}
      accessibilityLabel="Loading transfer details">
      {/* Header: avatar, direction, amount, transfer name */}
      <View style={styles.header}>
        <Bone progress={progress} width={64} height={64} radius={32} />
        <Bone progress={progress} width={160} height={15} style={styles.direction} />
        <Bone progress={progress} width={190} height={38} radius={8} />
        <Bone progress={progress} width={120} height={15} />
      </View>

      {/* Info card */}
      <View style={styles.card}>
        {INFO_ROWS.map((row, index) => (
          <View key={index} style={styles.row}>
            <Bone progress={progress} width={row.label} height={14} />
            <Bone progress={progress} width={row.value} height={14} />
          </View>
        ))}
      </View>

      {/* Share button */}
      <Bone progress={progress} height={52} radius={26} style={styles.button} />
    </ScrollView>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  spacing: ReturnType<typeof useAppTheme>['SPACING']
) =>  StyleSheet.create({
  content: {
    paddingHorizontal: spacing.space_20,
    paddingTop: spacing.space_16,
    paddingBottom: spacing.space_30,
  },
  bone: {
    backgroundColor: colors.skeleton,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    experimental_backgroundImage: SHIMMER_GRADIENT,
  },
  header: {
    alignItems: 'center',
    gap: spacing.space_8,
    paddingTop: spacing.space_12,
    paddingBottom: spacing.space_24,
  },
  direction: {
    marginTop: spacing.space_4,
  },
  card: {
    borderRadius: 18,
    paddingVertical: spacing.space_4,
    paddingHorizontal: spacing.space_16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.space_14,
  },
  button: {
    marginTop: spacing.space_20,
  },
});
