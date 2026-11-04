import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '../../../../../lib/supabase-server';
import { readJsonBodyLimited } from '../../../../../lib/http';
const noStore={'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'};
const schema=z.object({ balance: z.number().int().min(0).max(100000000), currency:z.literal('IDR').default('IDR'), readMethod:z.enum(['nfc','manual']).default('nfc'), readAt:z.string().datetime().optional() });
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const auth=await requireUser(req); if(auth.error)return auth.error;
 const input = await readJsonBodyLimited(req, 2_048);
 if (!input.ok) return NextResponse.json({error:input.error},{status:input.status,headers:noStore});
 try{const { id } = await params; const body=schema.parse(input.value);
  const {data:card,error:cardError}=await auth.supabase!.from('cards').select('id').eq('id',id).eq('user_id',auth.user!.id).single();
  if(cardError||!card)return NextResponse.json({error:'Kartu tidak ditemukan.'},{status:404,headers:noStore});
  const {data,error}=await auth.supabase!.from('balance_snapshots').insert({user_id:auth.user!.id,card_id:id,balance:body.balance,currency:body.currency,read_method:body.readMethod,read_at:body.readAt||new Date().toISOString()}).select('id,balance,currency,read_method,read_at').single();
  if(error)return NextResponse.json({error:'Saldo gagal disimpan.'},{status:400,headers:noStore});
  return NextResponse.json({snapshot:data},{status:201,headers:noStore});
 }catch{return NextResponse.json({error:'Data saldo tidak valid.'},{status:400,headers:noStore});}
}
