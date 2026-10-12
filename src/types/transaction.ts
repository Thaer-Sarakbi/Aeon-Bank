export interface Transaction {
  refId: string;
  /** ISO 8601 timestamp in UTC. */
  transferDate: string;
  recipientName: string;
  transferName: string;
  /** Positive = money received, negative = money sent. */
  amount: number;
}
