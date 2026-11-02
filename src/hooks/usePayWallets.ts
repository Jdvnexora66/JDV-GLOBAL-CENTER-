'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { PayWallet } from '@/lib/pay/types';

export function usePayWallets() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<PayWallet[] | null>(null);
  const refresh = useCallback(async () => {
    if (!user?.id) { setWallets([]); return; }
    const { data, error } = await createClient().from('wallets')
      .select('id,balance,available_balance,wallet_status,currency_id,currencies(code,symbol,decimal_places)')
      .eq('user_id', user.id)
      .is('organization_id', null)
      .order('balance', { ascending: false });
    if (error) { setWallets([]); return; }
    setWallets(((data ?? []) as unknown as PayWallet[]).sort((a, b) => (b.balance > 0 ? 1 : 0) - (a.balance > 0 ? 1 : 0) || a.currencies.code.localeCompare(b.currencies.code)));
  }, [user?.id]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { wallets, refresh };
}
