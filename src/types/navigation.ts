import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  TransactionsList: undefined;
  TransactionDetails: { refId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
