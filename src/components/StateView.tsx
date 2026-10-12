import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

import InfoText from './InfoText';
import PrimaryButton from './PrimaryButton';
import TitleText from './TitleText';

type StateViewProps =
  | { variant: 'loading'; message?: string }
  | { variant: 'empty' | 'error'; title: string; message?: string; onRetry?: () => void };

/** Full-screen placeholder for loading, empty and error states. */
export default function StateView(props: StateViewProps) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
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
    marginTop: 16,
  },
});
