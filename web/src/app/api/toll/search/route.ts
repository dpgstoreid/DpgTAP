import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchAllOperators } from '../../../../../../backend/search';
import { checkSearchRateLimit, getSearchRateLimitKey, hasTrustedSearchProxyConfigured } from '../../../../lib/rate-limit';
import { readJsonBodyLimited } from '../../../../lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 2_048;
const schema = z.object({
  cardNumber: z.string().regex(/^\d{8,24}$/),
  periodDays: z.union([z.literal(7), z.literal(14), z.literal(30)]),
  consent: z.literal(true),
}).strict();
const noStore = { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' };

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !hasTrustedSearchProxyConfigured()) {
    return NextResponse.json({ error: 'Pencarian belum diaktifkan: identitas proxy tepercaya belum dikonfigurasi.' }, { status: 503, headers: noStore });
  }

  const origin = req.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).origin !== req.nextUrl.origin) {
        return NextResponse.json({ error: 'Permintaan lintas situs ditolak.' }, { status: 403, headers: noStore });
      }
    } catch {
      return NextResponse.json({ error: 'Asal permintaan tidak valid.' }, { status: 403, headers: noStore });
    }
  }

  const limit = checkSearchRateLimit(getSearchRateLimitKey(req.headers));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak pencarian. Tunggu sebentar sebelum mencoba lagi.' },
      { status: 429, headers: { ...noStore, 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const body = await readJsonBodyLimited(req, MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: body.status, headers: noStore });
  }
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Permintaan tidak valid. Periksa nomor kartu, periode, dan persetujuan pencarian.' }, { status: 400, headers: noStore });
  }

  try {
    const result = await searchAllOperators(parsed.data.cardNumber, parsed.data.periodDays, req.signal);
    return NextResponse.json(result, { headers: noStore });
  } catch {
    // Intentionally do not log request bodies, card numbers, or upstream responses.
    return NextResponse.json({ error: 'Pencarian operator gagal diproses. Coba kembali beberapa saat lagi.' }, { status: 500, headers: noStore });
  }
}
