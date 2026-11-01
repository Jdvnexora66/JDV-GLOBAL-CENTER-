import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const TABS = [['/pay', 'Accueil'], ['/pay/send', 'Envoyer'], ['/pay/receive', 'Recevoir'], ['/pay/history', 'Historique'], ['/pay/beneficiaries', 'Bénéficiaires']] as const;

export default function PayHeader({ title, active, back = '/pay' }: { title: string; active: string; back?: string }) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3">
        <Link href={back} aria-label="Retour" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <h1 className="text-xl font-extrabold text-foreground">{title}</h1>
      </div>
      <nav aria-label="Navigation JDV PAY" className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2 text-sm [scrollbar-width:thin]">
        {TABS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={active === href ? 'page' : undefined}
            className={`min-h-10 shrink-0 whitespace-nowrap rounded-full px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${active === href ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground hover:bg-muted/70'}`}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
