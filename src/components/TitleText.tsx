import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors } from '@/theme/colors';

/** Primary, emphasised text (names, headings). */
export default function TitleText({ style, ...rest }: TextProps) {
  return <Text numberOfLines={1} {...rest} style={[styles.title, style]} />;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
