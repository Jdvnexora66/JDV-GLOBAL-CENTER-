import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0', 'Pragma': 'no-cache' };
const TOKEN_RE = /^[0-9a-f]{64}$/i;

export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!TOKEN_RE.test(token)) {
    return NextResponse.json({ valid: false, message: 'Reçu introuvable ou non valide.' }, { status: 404, headers: noStore });
  }
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('jdv_pay_verify_receipt_token', { p_token: token });
    if (error) return NextResponse.json({ error: 'Vérification momentanément indisponible.' }, { status: 503, headers: noStore });
    const receipt = Array.isArray(data) ? data[0] : data;
    if (!receipt?.is_valid) {
      return NextResponse.json({ valid: false, message: 'Reçu expiré, révoqué ou non valide.' }, { status: 404, headers: noStore });
    }
    return NextResponse.json({
      valid: true,
      reference: receipt.public_reference,
      date: receipt.transaction_date,
      amount: receipt.amount,
      currency: receipt.currency_code,
      status: receipt.transaction_status,
    }, { status: 200, headers: noStore });
  } catch {
    return NextResponse.json({ error: 'Service momentanément indisponible.' }, { status: 503, headers: noStore });
  }
}
