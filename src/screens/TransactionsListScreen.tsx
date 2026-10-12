import { useEffect } from 'react';

import StateView from '@/components/StateView';
import TransactionList from '@/components/TransactionList';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import type { RootStackScreenProps } from '@/types/navigation';

export default function TransactionsListScreen({
  navigation,
}: RootStackScreenProps<'TransactionsList'>) {
  const transactions = useTransactionsStore((s) => s.transactions);
  const status = useTransactionsStore((s) => s.status);
  const error = useTransactionsStore((s) => s.error);
  const fetchTransactions = useTransactionsStore((s) => s.fetchTransactions);

  useEffect(() => {
    if (useTransactionsStore.getState().status === 'idle') {
      fetchTransactions();
    }
  }, [fetchTransactions]);

  const isInitialLoad = (status === 'idle' || status === 'loading') && transactions.length === 0;

  if (isInitialLoad) {
    return <StateView variant="loading" message="Loading transfers…" />;
  }

  if (status === 'error') {
    return (
      <StateView
        variant="error"
        title="Couldn't load transfers"
        message={error ?? undefined}
        onRetry={fetchTransactions}
      />
    );
  }

  return (
    <TransactionList
      data={transactions}
      onPressItem={(t) => navigation.navigate('TransactionDetails', { refId: t.refId })}
      refreshing={status === 'loading'}
      onRefresh={fetchTransactions}
      ListEmptyComponent={
        <StateView
          variant="empty"
          title="No transfers yet"
          message="Transfers you send or receive will appear here."
        />
      }
    />
  );
}
