import type { ReactElement } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import type { Transaction } from '@/types/transaction';

import { SPACING } from '@/theme/spacing';
import { useAppTheme } from '@/theme/useAppTheme';
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
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);
  
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
  const { colors } = useAppTheme();
  const styles = createStyles(colors, SPACING);

  return <View style={styles.separator} />;
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  spacing: ReturnType<typeof useAppTheme>['SPACING']
) => StyleSheet.create({
  content: {
    paddingHorizontal: spacing.space_20,
    paddingTop: spacing.space_8,
    paddingBottom: spacing.space_34,
  },
  emptyContent: {
    flexGrow: 1,
  },
  separator: {
    height: spacing.space_8,
  },
});
