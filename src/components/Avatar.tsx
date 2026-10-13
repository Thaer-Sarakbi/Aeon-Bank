import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/theme/useAppTheme';
import { getAvatarColor } from '@/utils/avatarColor';
import { getInitials } from '@/utils/format';

interface AvatarProps {
  name: string;
  size?: number;
}

/** Round picture showing the person's initials on a pastel background. */
export default function Avatar({ name, size = 42 }: AvatarProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getAvatarColor(name),
        },
      ]}>
      <Text style={[styles.initials, { fontSize: Math.round(size * 0.32) }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const createStyles = (
    colors: ReturnType<typeof useAppTheme>['colors']
  ) => StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
    color: colors.text,
  },
});
