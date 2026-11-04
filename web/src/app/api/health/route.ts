import { NextResponse } from 'next/server';
import { supabaseConfigured } from '../../../lib/supabase-server';

export async function GET() {
  return NextResponse.json(
    {
      app: 'DpgTAP',
      status: 'ok',
      mode: supabaseConfigured() ? 'cloud-configured' : 'local-first',
      timestamp: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' } },
  );
}
