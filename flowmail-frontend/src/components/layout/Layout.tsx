'use client';

import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  const bgPattern = `data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%235850ec" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-pink-50/20 dark:from-background dark:via-purple-900/10 dark:to-pink-900/10 flex flex-col" style={{ height: '100vh' }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url('${bgPattern}')` }}></div>
      <Header />
      <main className="flex-1 flex flex-col min-h-0 relative" style={{ minHeight: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}
