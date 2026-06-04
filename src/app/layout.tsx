import type { Metadata } from 'next';
import '../index.css';
import { AppProvider } from '../context/AppContext';

export const metadata: Metadata = {
  title: 'Sheba.xyz Ticketing Portal',
  description: 'Manage support tickets and users in real time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060a13] text-slate-105 antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
