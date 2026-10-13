import { StyleSheet, Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/theme/useAppTheme';

/** Primary, emphasised text (names, headings). */
export default function TitleText({ style, ...rest }: TextProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return <Text numberOfLines={1} {...rest} style={[styles.title, style]} />;
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors']
) => StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
