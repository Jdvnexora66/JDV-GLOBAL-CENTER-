import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const TABS = [['/pay', 'Accueil'], ['/pay/send', 'Envoyer'], ['/pay/receive', 'Recevoir'], ['/pay/history', 'Historique'], ['/pay/beneficiaries', 'Contacts'], ['/pay/profile', 'Profil'], ['/pay/kyc', 'KYC'], ['/pay/security', 'Sécurité']] as const;

export default function PayHeader({ title, active, back = '/pay' }: { title: string; active: string; back?: string }) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3">
        <Link href={back} aria-label="Retour" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[.24em] text-accent">JDV GLOBAL CENTER</p>
          <h1 className="text-xl font-extrabold text-foreground">{title}</h1>
        </div>
        <span className="hidden rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-[11px] font-semibold text-warning sm:inline-flex">Mode sécurisé · Paiements réels désactivés</span>
      </div>
      <nav aria-label="JDV PAY" className="mt-4 flex gap-1 overflow-x-auto text-sm">
        {TABS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={active === href ? 'page' : undefined}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 ${active === href ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground hover:bg-muted/70'}`}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
