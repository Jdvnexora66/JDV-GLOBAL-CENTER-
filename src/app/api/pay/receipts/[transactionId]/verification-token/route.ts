import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0', 'Pragma': 'no-cache' };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, context: { params: Promise<{ transactionId: string }> }) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403, headers: noStore });
  }
  const { transactionId } = await context.params;
  if (!UUID_RE.test(transactionId)) {
    return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400, headers: noStore });
  }
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Authentification requise.' }, { status: 401, headers: noStore });

    const { data, error } = await supabase.rpc('jdv_pay_issue_receipt_verification_token', { p_transaction_id: transactionId });
    if (error) {
      // Do not reveal whether a transaction exists or belongs to another account.
      return NextResponse.json({ error: 'Ce reçu ne peut pas recevoir de lien de vérification.' }, { status: 403, headers: noStore });
    }
    const issued = Array.isArray(data) ? data[0] : data;
    if (!issued?.token || !issued?.expires_at) {
      return NextResponse.json({ error: 'Émission du jeton impossible.' }, { status: 500, headers: noStore });
    }
    return NextResponse.json({ token: issued.token, expiresAt: issued.expires_at }, { status: 200, headers: noStore });
  } catch {
    return NextResponse.json({ error: 'Service momentanément indisponible.' }, { status: 503, headers: noStore });
  }
}
