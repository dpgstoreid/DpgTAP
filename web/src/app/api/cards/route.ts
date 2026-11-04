import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '../../../lib/supabase-server';
import { readJsonBodyLimited } from '../../../lib/http';
const noStore = { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' };
const createSchema = z.object({ issuer: z.enum(['mandiri','brizzi','flazz','tapcash','other']), nickname: z.string().trim().min(1).max(40), last4: z.string().regex(/^\d{4}$/), cardFingerprint: z.string().regex(/^[a-f0-9]{64}$/i) });
export async function GET(req: NextRequest) {
 const auth = await requireUser(req); if (auth.error) return auth.error;
 const { data, error } = await auth.supabase!.from('cards').select('id,issuer,nickname,last4,created_at,updated_at').order('created_at',{ascending:false});
 if (error) return NextResponse.json({error:'Gagal mengambil kartu.'},{status:500,headers:noStore});
 return NextResponse.json({cards:data},{headers:noStore});
}
export async function POST(req: NextRequest) {
 const auth = await requireUser(req); if (auth.error) return auth.error;
 const input = await readJsonBodyLimited(req, 4_096);
 if (!input.ok) return NextResponse.json({error:input.error},{status:input.status,headers:noStore});
 try { const body=createSchema.parse(input.value);
  const { data, error } = await auth.supabase!.from('cards').upsert({ user_id:auth.user!.id, issuer:body.issuer, nickname:body.nickname, last4:body.last4, card_fingerprint:body.cardFingerprint },{onConflict:'user_id,card_fingerprint'}).select('id,issuer,nickname,last4,created_at').single();
  if(error) return NextResponse.json({error:'Kartu gagal disimpan.'},{status:400,headers:noStore});
  return NextResponse.json({card:data},{status:201,headers:noStore});
 } catch { return NextResponse.json({error:'Format data kartu tidak valid.'},{status:400,headers:noStore}); }
}
