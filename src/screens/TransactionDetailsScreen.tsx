import { Alert, ScrollView, Share, StyleSheet, View } from 'react-native';

import AmountText from '@/components/AmountText';
import Avatar from '@/components/Avatar';
import InfoCard from '@/components/InfoCard';
import InfoText from '@/components/InfoText';
import PrimaryButton from '@/components/PrimaryButton';
import StateView from '@/components/StateView';
import TitleText from '@/components/TitleText';
import { selectTransactionById, useTransactionsStore } from '@/store/useTransactionsStore';
import { colors } from '@/theme/colors';
import type { RootStackScreenProps } from '@/types/navigation';
import { formatAmount, formatDateLong, isIncoming } from '@/utils/format';

export default function TransactionDetailsScreen({
  route,
}: RootStackScreenProps<'TransactionDetails'>) {
  const { refId } = route.params;
  const transaction = useTransactionsStore(selectTransactionById(refId));

  if (!transaction) {
    return (
      <StateView
        variant="error"
        title="Transfer not found"
        message={`We couldn't find a transfer with reference ${refId}.`}
      />
    );
  }

  const { recipientName, transferName, transferDate, amount } = transaction;
  const incoming = isIncoming(amount);
  const dateLong = formatDateLong(transferDate);

  const shareReceipt = async () => {
    try {
      await Share.share({
        message: [
          `Transfer receipt — ${transferName}`,
          `${incoming ? 'From' : 'To'}: ${recipientName}`,
          `Amount: ${formatAmount(amount)}`,
          `Date: ${dateLong}`,
          `Reference: ${refId}`,
        ].join('\n'),
      });
    } catch {
      Alert.alert('Unable to share', 'Please try again.');
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar name={recipientName} size={64} />
        <InfoText style={styles.direction}>
          {incoming ? `Received from ${recipientName}` : `Sent to ${recipientName}`}
        </InfoText>
        <AmountText amount={amount} size="lg" />
        <TitleText style={styles.transferName}>{transferName}</TitleText>
      </View>

      <InfoCard
        rows={[
          { label: 'Reference ID', value: <InfoText mono style={styles.refValue}>{refId}</InfoText> },
          { label: 'Transfer date', value: dateLong },
          { label: incoming ? 'Sender' : 'Recipient', value: recipientName },
          { label: 'Transfer name', value: transferName },
        ]}
      />

      <PrimaryButton title="Share receipt" onPress={shareReceipt} style={styles.share} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 24,
  },
  direction: {
    fontSize: 15,
    marginTop: 4,
    textAlign: 'center',
  },
  transferName: {
    fontWeight: '500',
  },
  refValue: {
    fontSize: 13,
    color: colors.text,
  },
  share: {
    marginTop: 20,
  },
});
