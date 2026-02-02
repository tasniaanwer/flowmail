'use client';

import Link from 'next/link';
import { Zap, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-border/20 backdrop-blur-sm bg-gradient-to-r from-white via-purple-50/50 to-pink-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 px-6 flex items-center justify-between shadow-lg shadow-primary/5 animate-fade-in-down">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow transform group-hover:scale-110 transition-transform duration-300">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-bounce-gentle" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">FlowMail</span>
          <span className="text-xs text-muted-foreground">Email Automation Builder</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-accent text-white text-xs font-medium shadow-glow">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Live
        </div>
      </div>
    </header>
  );
}
