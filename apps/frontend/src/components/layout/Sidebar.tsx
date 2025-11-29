'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  FolderOpen,
  Settings,
  LogOut,
  Users2,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

import { Sparkles } from 'lucide-react';

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: Sparkles },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Customers', href: '/dashboard/customers', icon: Users2 },
  { name: 'Accounts', href: '/dashboard/accounts', icon: Wallet },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
  { name: 'Files', href: '/dashboard/files', icon: FolderOpen },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, currentUser } = useAuth();

  return (
    <div className="flex flex-col w-64 bg-gray-900 h-screen">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <h1 className="text-xl font-bold text-white">OmniBusiness AI</h1>
      </div>

      {/* User info */}
      {currentUser && (
        <div className="px-4 py-3 bg-gray-800">
          <p className="text-sm font-medium text-white">
            {currentUser.firstName || currentUser.email}
          </p>
          <p className="text-xs text-gray-400">{currentUser.email}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-gray-800">
        <button
          onClick={() => logout()}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
