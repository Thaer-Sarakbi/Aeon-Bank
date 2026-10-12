import type { Transaction } from '@/types/transaction';

export const data: Transaction[] = [
  {
    refId: '123ABC',
    transferDate: '2024-10-15T12:34:56Z', // Mock transfer date in UTC
    recipientName: 'John Doe',
    transferName: 'Salary Payment',
    amount: 1500.0,
  },
  {
    refId: '456DEF',
    transferDate: '2024-09-21T09:12:45Z', // Mock transfer date in UTC
    recipientName: 'Jane Smith',
    transferName: 'Invoice Payment',
    amount: 2300.75,
  },
  {
    refId: '789GHI',
    transferDate: '2024-10-05T16:18:30Z', // Mock transfer date in UTC
    recipientName: 'Robert Brown',
    transferName: 'Refund',
    amount: -500.0, // Negative amount for a refund
  },
  {
    refId: '101JKL',
    transferDate: '2024-08-30T11:47:22Z', // Mock transfer date in UTC
    recipientName: 'Emily Davis',
    transferName: 'Bonus Payment',
    amount: 1200.0,
  },
];
