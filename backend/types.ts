export type ConnectorStatus = 'ready' | 'not_configured' | 'unavailable';

export type TollTransaction = {
  operatorCode: string;
  operatorName: string;
  transactionAt: string;
  entryGate?: string | null;
  exitGate?: string | null;
  gate?: string | null;
  lane?: string | null;
  vehicleClass?: string | null;
  amount?: number | null;
  balanceAfter?: number | null;
  cardLast4: string;
  receiptId?: string | null;
  sourceUrl: string;
  originalReceiptUrl?: string | null;
  verification: 'source_returned' | 'operator_receipt';
};

export type ConnectorResult = {
  code: string;
  name: string;
  status: ConnectorStatus;
  message: string;
  transactions: TollTransaction[];
};

export type ConnectorSearchInput = {
  cardNumber: string;
  dateFrom: string;
  dateTo: string;
  /** Adapters must pass this signal to fetch/HTTP clients so timeouts cancel network work. */
  signal: AbortSignal;
};

export interface TollOperatorAdapter {
  code: string;
  name: string;
  enabled: boolean;
  /** Exact official domains approved for outbound/source links (no wildcards). */
  allowedDomains: readonly string[];
  search(input: ConnectorSearchInput): Promise<ConnectorResult>;
}
