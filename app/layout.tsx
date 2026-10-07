import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Föy Evi — Test, Yazılı, Deneme ve Soru Bankası Stüdyosu',
  description: 'Kendi sorularınız, logonuz ve kurumsal kimliğinizle yayınevi kalitesinde yaprak test, yazılı sınav, deneme ve soru bankası hazırlama programı.',
  openGraph: {
    title: 'Föy Evi — Kendi Yayıneviniz Olun',
    description: 'Öğretmenler ve kurumlar için materyal hazırlama aracı. Kendi sorularınız, kendi markanız, yayınevi kalitesinde çıktı.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Föy Evi — Kendi Yayıneviniz Olun',
    description: 'Kendi sorularınızla, kendi logonuzla, yayınevi kalitesinde materyal üretin.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="tr" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-stone-100 text-stone-900 antialiased selection:bg-amber-100 selection:text-amber-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
