import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function supabaseForRequest(req: NextRequest): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
}

export async function requireUser(req: NextRequest) {
  const supabase = supabaseForRequest(req);
  if (!supabase) return { error: NextResponse.json({ error: 'Cloud sync belum dikonfigurasi atau sesi login tidak tersedia.' }, { status: 401, headers: { 'Cache-Control': 'no-store, private' } }), supabase: null, user: null };
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { error: NextResponse.json({ error: 'Sesi tidak valid. Silakan login ulang.' }, { status: 401, headers: { 'Cache-Control': 'no-store, private' } }), supabase: null, user: null };
  return { error: null, supabase, user: data.user };
}
