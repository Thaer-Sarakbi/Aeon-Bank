import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TransactionDetailsScreen from '@/screens/TransactionDetailsScreen';
import TransactionsListScreen from '@/screens/TransactionsListScreen';
import { colors } from '@/theme/colors';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.accent,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="TransactionsList"
        component={TransactionsListScreen}
        options={{ title: 'Transfers', headerLargeTitle: true }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ title: 'Details', headerBackTitle: 'Transfers' }}
      />
    </Stack.Navigator>
  );
}
