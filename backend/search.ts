import { isIP } from 'node:net';
import { z } from 'zod';
import { registry } from './registry';
import type { ConnectorResult, TollOperatorAdapter, TollTransaction } from './types';

const CONNECTOR_TIMEOUT_MS = 12_000;
const transactionSchema = z.object({
  operatorCode: z.string().min(1).max(40),
  operatorName: z.string().min(1).max(100),
  transactionAt: z.string().datetime({ offset: true }),
  entryGate: z.string().max(120).nullable().optional(),
  exitGate: z.string().max(120).nullable().optional(),
  gate: z.string().max(120).nullable().optional(),
  lane: z.string().max(40).nullable().optional(),
  vehicleClass: z.string().max(60).nullable().optional(),
  amount: z.number().int().min(0).max(100_000_000).nullable().optional(),
  balanceAfter: z.number().int().min(0).max(1_000_000_000).nullable().optional(),
  cardLast4: z.string().regex(/^\d{4}$/),
  receiptId: z.string().trim().min(1).max(160).nullable().optional(),
  sourceUrl: z.string().url().max(2048),
  originalReceiptUrl: z.string().url().max(2048).nullable().optional(),
  verification: z.enum(['source_returned', 'operator_receipt']),
});
const connectorResultSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(100),
  status: z.enum(['ready', 'not_configured', 'unavailable']),
  message: z.string().max(500),
  transactions: z.array(transactionSchema).max(1_000),
});

function jakartaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}
function isoDateFromParts(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function isAllowedSourceUrl(value: string, allowedDomains: readonly string[], cardNumber: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || isIP(url.hostname)) return false;
    const host = url.hostname.toLowerCase();
    // Never return a receipt/source link that embeds the full PAN in its path or query.
    const decodedUrl = decodeURIComponent(url.href.replace(/\+/g, '%20'));
    if (decodedUrl.includes(cardNumber)) return false;
    return allowedDomains.some((domain) => {
      const approved = domain.toLowerCase().trim().replace(/^\.+|\.+$/g, '');
      return Boolean(approved) && host === approved;
    });
  } catch { return false; }
}
function errorResult(adapter: TollOperatorAdapter, status: 'not_configured' | 'unavailable', message: string): ConnectorResult {
  return { code: adapter.code, name: adapter.name, status, message, transactions: [] };
}

async function runWithTimeout(
  adapter: TollOperatorAdapter,
  input: { cardNumber: string; dateFrom: string; dateTo: string },
  requestSignal?: AbortSignal,
): Promise<ConnectorResult> {
  if (requestSignal?.aborted) throw new Error('REQUEST_ABORTED');
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let requestAbortHandler: (() => void) | undefined;
  let rejectRequestAbort: ((reason?: unknown) => void) | undefined;
  try {
    const requestAborted = requestSignal ? new Promise<never>((_, reject) => {
      rejectRequestAbort = reject;
    }) : null;
    if (requestSignal) {
      requestAbortHandler = () => {
        controller.abort(requestSignal.reason);
        rejectRequestAbort?.(new Error('REQUEST_ABORTED'));
      };
      requestSignal.addEventListener('abort', requestAbortHandler, { once: true });
    }

    const operation = adapter.search({ ...input, signal: controller.signal });
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort(new Error('CONNECTOR_TIMEOUT'));
        reject(new Error('CONNECTOR_TIMEOUT'));
      }, CONNECTOR_TIMEOUT_MS);
    });
    return await Promise.race(requestAborted ? [operation, timeout, requestAborted] : [operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
    if (requestSignal && requestAbortHandler) requestSignal.removeEventListener('abort', requestAbortHandler);
    if (!controller.signal.aborted) controller.abort();
  }
}

function isWithinJakartaDate(value: string, from: string, to: string): boolean {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return false;
  const p = jakartaDateParts(date);
  const localDate = isoDateFromParts(p.year, p.month, p.day);
  return localDate >= from && localDate <= to;
}

function normalizeTransactions(
  result: ConnectorResult,
  adapter: TollOperatorAdapter,
  cardLast4: string,
  dateFrom: string,
  dateTo: string,
  cardNumber: string,
): TollTransaction[] {
  const parsed = connectorResultSchema.safeParse(result);
  if (!parsed.success || parsed.data.code !== adapter.code || parsed.data.name !== adapter.name || parsed.data.status !== 'ready') return [];
  const accepted: TollTransaction[] = [];
  for (const transaction of parsed.data.transactions) {
    if (transaction.operatorCode !== adapter.code || transaction.cardLast4 !== cardLast4) continue;
    const userFacingFields = [transaction.receiptId, transaction.entryGate, transaction.exitGate, transaction.gate, transaction.lane, transaction.vehicleClass];
    if (userFacingFields.some((value) => typeof value === 'string' && value.includes(cardNumber))) continue;
    if (!isWithinJakartaDate(transaction.transactionAt, dateFrom, dateTo)) continue;
    if (!isAllowedSourceUrl(transaction.sourceUrl, adapter.allowedDomains, cardNumber)) continue;
    if (transaction.originalReceiptUrl && !isAllowedSourceUrl(transaction.originalReceiptUrl, adapter.allowedDomains, cardNumber)) continue;
    accepted.push({ ...transaction, operatorName: adapter.name });
  }
  return accepted;
}

function deduplicate(transactions: TollTransaction[]): TollTransaction[] {
  const seen = new Set<string>();
  return transactions.filter((transaction) => {
    // Prefer receipt identity. Without one, remove only exact duplicate records;
    // similar-looking toll trips are not enough evidence to collapse two events.
    const key = transaction.receiptId
      ? `${transaction.operatorCode}:receipt:${transaction.receiptId}`
      : `${transaction.operatorCode}:exact:${[
          transaction.transactionAt, transaction.cardLast4, transaction.amount ?? '',
          transaction.entryGate ?? transaction.gate ?? '', transaction.exitGate ?? '',
          transaction.lane ?? '', transaction.vehicleClass ?? '', transaction.sourceUrl,
          transaction.originalReceiptUrl ?? '', transaction.verification, transaction.operatorName,
        ].join('|')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => Date.parse(b.transactionAt) - Date.parse(a.transactionAt));
}

export async function searchAllOperators(cardNumber: string, periodDays: 7 | 14 | 30, requestSignal?: AbortSignal) {
  if (!/^\d{8,24}$/.test(cardNumber) || ![7, 14, 30].includes(periodDays)) {
    throw new Error('INVALID_SEARCH_INPUT');
  }
  const today = jakartaDateParts(new Date());
  const fromUtc = new Date(Date.UTC(today.year, today.month - 1, today.day - (periodDays - 1)));
  const dateFrom = isoDateFromParts(fromUtc.getUTCFullYear(), fromUtc.getUTCMonth() + 1, fromUtc.getUTCDate());
  const dateTo = isoDateFromParts(today.year, today.month, today.day);
  // An adapter cannot run unless it is explicitly enabled AND has an exact approved domain allowlist.
  const enabled = registry.filter((adapter) => adapter.enabled && adapter.allowedDomains.length > 0);
  const misconfigured = registry.filter((adapter) => adapter.enabled && adapter.allowedDomains.length === 0);
  const settled = await Promise.allSettled(enabled.map((adapter) =>
    runWithTimeout(adapter, { cardNumber, dateFrom, dateTo }, requestSignal),
  ));
  const activeResults = settled.map((result, index): ConnectorResult => {
    const adapter = enabled[index];
    if (result.status === 'rejected') {
      return errorResult(adapter, 'unavailable', 'Konektor tidak merespons dalam batas waktu. Tidak ada transaksi yang diasumsikan.');
    }
    const parsed = connectorResultSchema.safeParse(result.value);
    if (!parsed.success || parsed.data.code !== adapter.code || parsed.data.name !== adapter.name) {
      return errorResult(adapter, 'unavailable', 'Respons konektor tidak sesuai format yang diharapkan.');
    }
    return { ...parsed.data, message: parsed.data.message.split(cardNumber).join('[nomor kartu disamarkan]'), transactions: [] };
  });
  const activeTransactions = settled.flatMap((result, index) => {
    if (result.status !== 'fulfilled') return [];
    return normalizeTransactions(result.value, enabled[index], cardNumber.slice(-4), dateFrom, dateTo, cardNumber);
  });
  const activeByCode = new Map(activeResults.map((result) => [result.code, result]));
  const connectors = registry.map((adapter) => activeByCode.get(adapter.code) ??
    errorResult(adapter, 'not_configured', misconfigured.includes(adapter)
      ? 'Konektor belum memiliki daftar domain resmi yang disetujui.'
      : 'Konektor resmi belum dikonfigurasi atau belum memperoleh otorisasi.'));
  const transactions = deduplicate(activeTransactions);
  return {
    periodDays, dateFrom, dateTo,
    connectors: connectors.map(({ transactions: _transactions, ...connector }) => connector),
    transactions,
    note: enabled.length > 0
      ? 'Hasil hanya berasal dari konektor aktif yang responsnya lolos validasi. Periksa sumber dan struk asli pada setiap transaksi.'
      : 'Belum ada konektor transaksi yang lolos verifikasi dan diaktifkan. Tidak ada transaksi yang dibuat atau diperkirakan oleh DpgTAP.',
  };
}
