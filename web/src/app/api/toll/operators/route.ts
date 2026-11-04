import { NextResponse } from 'next/server';
import { registry } from '../../../../../../backend/registry';

export async function GET() {
  return NextResponse.json(
    {
      operators: registry.map(({ code, name, enabled, allowedDomains }) => ({
        code,
        name,
        status: enabled && allowedDomains.length > 0 ? 'ready' : 'not_configured',
      })),
    },
    { headers: { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' } },
  );
}
