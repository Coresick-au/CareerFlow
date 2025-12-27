import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Briefcase,
  DollarSign,
  TrendingUp,
  FileText,
  Settings as SettingsIcon,
  Menu,
  X,
  LucideIcon,
  HelpCircle
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { ThemeToggle } from './ui/theme-toggle';
import { UserSelector } from './UserSelector';
import { WelcomeModal } from './WelcomeModal';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'text-blue-500' },
    { name: 'Profile', href: '/profile', icon: User, color: 'text-purple-500' },
    { name: 'Career Ledger', href: '/ledger', icon: DollarSign, color: 'text-green-500' },
    { name: 'Career Timeline', href: '/career', icon: Briefcase, color: 'text-orange-500' },
    { name: 'Analysis', href: '/analysis', icon: TrendingUp, color: 'text-cyan-500' },
    { name: 'Resume Export', href: '/resume', icon: FileText, color: 'text-pink-500' },
    { name: 'Settings', href: '/settings', icon: SettingsIcon, color: 'text-slate-400' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Welcome Modal - can be triggered by help button */}
      <WelcomeModal forceOpen={showWelcome} onClose={() => setShowWelcome(false)} />

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-card">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <h1 className="text-xl font-semibold text-foreground">CareerFlow</h1>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md hover:bg-accent"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 bg-background border-r border-border">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn("w-5 h-5 mr-3", item.color)} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex items-center justify-between h-16 px-4 border-b bg-card border-border">
            <h1 className="text-xl font-semibold text-foreground">CareerFlow</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWelcome(true)}
                className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="About CareerFlow"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <ThemeToggle />
            </div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 bg-background border-r border-border">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 mr-3", item.color)} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
          {/* User selector at bottom */}
          <div className="border-t border-border bg-background">
            <UserSelector />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header - only show on mobile */}
        <div className="flex items-center h-16 px-4 border-b bg-card border-border lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md hover:bg-accent"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-foreground">CareerFlow</h1>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
