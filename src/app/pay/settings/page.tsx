'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Bell, CreditCard, Wallet, Info } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MfaCard from '@/components/security/MfaCard';

export default function PaySettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-3">
        <Link href="/pay" aria-label="Retour à JDV PAY" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <AppLogo size={24} />
        <div>
          <p className="text-xs text-muted-foreground">JDV PAY</p>
          <p className="text-sm font-semibold text-foreground">Paramètres</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Paramètres JDV PAY</h2>
          <p className="text-sm text-muted-foreground">Gérez la protection de votre compte et vos préférences de paiement.</p>
        </div>

        <MfaCard />

        <section aria-labelledby="pay-settings-title" className="space-y-2">
          <h3 id="pay-settings-title" className="text-sm font-semibold text-foreground">Gestion du compte</h3>
          <div className="jdv-card divide-y divide-border">
            {[
              { href: '/pay/kyc', icon: <Shield size={16} />, label: 'Vérification d’identité (KYC)', description: 'Consultez votre niveau et votre statut de vérification' },
              { href: '/pay/beneficiaries', icon: <Wallet size={16} />, label: 'Bénéficiaires', description: 'Gérez vos bénéficiaires de transfert' },
              { href: '/settings', icon: <Bell size={16} />, label: 'Notifications', description: 'Consultez les préférences de notification du compte' },
              { href: '/settings', icon: <CreditCard size={16} />, label: 'Méthodes de paiement', description: 'Consultez les moyens de paiement disponibles' },
            ].map(({ href, icon, label, description }) => (
              <Link key={label} href={href} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <ArrowLeft aria-hidden size={14} className="text-muted-foreground rotate-180 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-info/10 border border-info/20">
          <Info size={16} className="text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-info mb-0.5">Protection des opérations</p>
            <p className="text-xs text-muted-foreground">
              L’activation de la 2FA renforce la connexion au compte. Les opérations sensibles devront également être protégées côté serveur avant toute mise en service financière.
            </p>
          </div>
        </div>

        <Link href="/pay" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Retour au tableau de bord PAY
        </Link>
      </div>
    </div>
  );
}
