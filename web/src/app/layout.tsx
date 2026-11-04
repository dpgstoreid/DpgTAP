import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import PwaRegister from '../components/pwa-register';

export const metadata: Metadata = {
  title: 'DpgTAP | Multi-Operator Toll Search',
  description: 'Pencarian transaksi tol terpadu Indonesia',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'DpgTAP' },
  icons: { icon: '/icon-192.png', apple: '/apple-touch-icon.png' },
};
export const viewport: Viewport = { themeColor: '#071b35', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{children: ReactNode}>) {
  return <html lang="id"><body><PwaRegister />{children}</body></html>;
}
