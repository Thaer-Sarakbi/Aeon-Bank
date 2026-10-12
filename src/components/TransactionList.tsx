import type { ReactElement } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import type { Transaction } from '@/types/transaction';

import TransactionListItem from './TransactionListItem';

interface TransactionListProps {
  data: Transaction[];
  onPressItem: (transaction: Transaction) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: ReactElement;
}

/** Reusable list of transfer cards. */
export default function TransactionList({
  data,
  onPressItem,
  refreshing = false,
  onRefresh,
  ListEmptyComponent,
}: TransactionListProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.refId}
      renderItem={({ item }) => <TransactionListItem transaction={item} onPress={onPressItem} />}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={[styles.content, data.length === 0 && styles.emptyContent]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />
        ) : undefined
      }
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 34,
  },
  emptyContent: {
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },
});
