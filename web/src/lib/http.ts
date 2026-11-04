export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413 | 415; error: string };

/** Read a small JSON request without buffering an unbounded body in memory. */
export async function readJsonBodyLimited(request: Request, maxBytes: number): Promise<BoundedJsonResult> {
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return { ok: false, status: 415, error: 'Content-Type harus application/json.' };
  }

  const lengthHeader = request.headers.get('content-length');
  if (lengthHeader !== null) {
    if (!/^\d+$/.test(lengthHeader)) {
      return { ok: false, status: 400, error: 'Content-Length tidak valid.' };
    }
    if (Number(lengthHeader) > maxBytes) {
      return { ok: false, status: 413, error: 'Ukuran permintaan terlalu besar.' };
    }
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: false, status: 400, error: 'Body permintaan kosong.' };

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return { ok: false, status: 413, error: 'Ukuran permintaan terlalu besar.' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: 'Body permintaan tidak dapat dibaca.' };
  } finally {
    reader.releaseLock();
  }

  try {
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 400, error: 'Format JSON tidak valid.' };
  }
}
