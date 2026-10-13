import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { SPACING } from '@/theme/spacing';
import { useAppTheme } from '@/theme/useAppTheme';
import InfoText from './InfoText';
import PrimaryButton from './PrimaryButton';
import TitleText from './TitleText';

type StateViewProps =
  | { variant: 'loading'; message?: string }
  | { variant: 'empty' | 'error'; title: string; message?: string; onRetry?: () => void };

/** Full-screen placeholder for loading, empty and error states. */
export default function StateView(props: StateViewProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);

  if (props.variant === 'loading') {
    return (
      <View style={styles.container} accessibilityLabel="Loading">
        <ActivityIndicator size="large" color={colors.textMuted} />
        {props.message ? <InfoText style={styles.message}>{props.message}</InfoText> : null}
      </View>
    );
  }

  const { title, message, onRetry } = props;
  return (
    <View style={styles.container}>
      <TitleText style={styles.title} numberOfLines={2}>
        {title}
      </TitleText>
      {message ? <InfoText style={styles.message}>{message}</InfoText> : null}
      {onRetry ? <PrimaryButton title="Try again" onPress={onRetry} style={styles.button} /> : null}
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  spacing: ReturnType<typeof useAppTheme>['SPACING']
) =>  StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.space_32,
    gap: spacing.space_8,
  },
  title: {
    fontSize: 17,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.space_16,
  },
});
