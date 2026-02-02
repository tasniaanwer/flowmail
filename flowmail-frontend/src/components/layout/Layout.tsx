'use client';

import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ height: '100vh' }}>
      <Header />
      <main className="flex-1 flex flex-col min-h-0" style={{ minHeight: 0 }}>
        {children}
      </main>
    </div>
  );
}
