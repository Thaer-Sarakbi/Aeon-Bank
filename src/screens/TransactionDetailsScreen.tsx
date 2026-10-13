import { Alert, ScrollView, Share, StyleSheet, View } from 'react-native';

import AmountText from '@/components/AmountText';
import Avatar from '@/components/Avatar';
import CopyButton from '@/components/CopyButton';
import InfoCard from '@/components/InfoCard';
import InfoText from '@/components/InfoText';
import PrimaryButton from '@/components/PrimaryButton';
import StateView from '@/components/StateView';
import TitleText from '@/components/TitleText';
import TransactionDetailsSkeleton from '@/components/TransactionDetailsSkeleton';
import { selectTransactionById, useTransactionsStore } from '@/store/useTransactionsStore';
import { SPACING } from '@/theme/spacing';
import { useAppTheme } from '@/theme/useAppTheme';
import type { RootStackScreenProps } from '@/types/navigation';
import { formatAmount, formatDateLong, isIncoming } from '@/utils/format';
import { useEffect, useState } from 'react';

export default function TransactionDetailsScreen({
  route,
}: RootStackScreenProps<'TransactionDetails'>) {
  const { refId } = route.params;
  const transaction = useTransactionsStore(selectTransactionById(refId));
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2500); 
  }, []);

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

  if(isLoading) return <TransactionDetailsSkeleton />
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
          {
            label: 'Reference ID',
            value: (
              <View style={styles.refRow}>
                <InfoText mono selectable style={styles.refValue}>{refId}</InfoText>
                <CopyButton value={refId} accessibilityLabel="Copy reference ID" />
              </View>
            ),
          },
          { label: 'Transfer date', value: dateLong },
          { label: incoming ? 'Sender' : 'Recipient', value: recipientName },
          { label: 'Transfer name', value: transferName },
        ]}
      />

      <PrimaryButton title="Share receipt" onPress={shareReceipt} style={styles.share} />
    </ScrollView>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  spacing: ReturnType<typeof useAppTheme>['SPACING']
) => StyleSheet.create({
  content: {
    paddingHorizontal: spacing.space_20,
    paddingTop: spacing.space_16,
    paddingBottom: spacing.space_30,
  },
  header: {
    alignItems: 'center',
    gap: spacing.space_8,
    paddingTop: spacing.space_12,
    paddingBottom: spacing.space_24,
  },
  direction: {
    fontSize: 15,
    marginTop: spacing.space_4,
    textAlign: 'center',
  },
  transferName: {
    fontWeight: '500',
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: spacing.space_8,
  },
  refValue: {
    flexShrink: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: 'bold'
  },
  share: {
    marginTop: spacing.space_20,
  },
});
