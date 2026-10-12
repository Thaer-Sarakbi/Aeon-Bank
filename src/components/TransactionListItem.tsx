import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import type { Transaction } from '@/types/transaction';
import { formatDateShort } from '@/utils/format';

import AmountText from './AmountText';
import Avatar from './Avatar';
import InfoText from './InfoText';
import TitleText from './TitleText';

interface TransactionListItemProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
}

export default function TransactionListItem({ transaction, onPress }: TransactionListItemProps) {
  const { recipientName, transferName, transferDate, amount, refId } = transaction;

  return (
    <Pressable
      onPress={() => onPress(transaction)}
      accessibilityRole="button"
      accessibilityLabel={`${transferName}, ${recipientName}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Avatar name={recipientName} />
      <View style={styles.body}>
        <View style={styles.row}>
          <TitleText style={styles.flex}>{recipientName}</TitleText>
          <AmountText amount={amount} />
        </View>
        <View style={styles.row}>
          <InfoText numberOfLines={1} style={styles.flex}>
            {transferName}
          </InfoText>
          <InfoText>{formatDateShort(transferDate)}</InfoText>
        </View>
        <InfoText mono style={styles.ref}>
          {refId}
        </InfoText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  pressed: {
    backgroundColor: colors.pressed,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
  },
  flex: {
    flexShrink: 1,
  },
  ref: {
    marginTop: 2,
  },
});
