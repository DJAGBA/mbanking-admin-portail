'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Zap,
  Building2,
} from 'lucide-react';
import { useSidebar } from '@/lib/sidebar-context';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size: number }>;
}

const menuItems: MenuItem[] = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Utilisateurs', href: '/users', icon: Users },
  { label: 'Plans tarifaires', href: '/plans', icon: DollarSign },
  { label: 'Limites de taux', href: '/rate-limits', icon: Zap },
  { label: 'Banques partenaires', href: '/banks', icon: Building2 },
];

function MenuItemLink({
  item,
  active,
  isCollapsed,
}: {
  item: MenuItem;
  active: boolean;
  isCollapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={isCollapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-primary text-white font-semibold'
          : 'text-primary hover:bg-primary hover:text-white'
      }`}
    >
      <Icon size={20} />
      {!isCollapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isHydrated } = useSidebar();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');
  const displayCollapsed = isHydrated ? isCollapsed : false;

  return (
    <aside
      className={`border-r flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out bg-secondary border-secondary ${
        displayCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="px-6 py-8 border-b border-secondary flex items-center justify-center">
        <Image
          src="/YAS3.png"
          alt="YAS Bank Logo"
          width={50}
          height={50}
          className="object-contain"
          priority
        />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <MenuItemLink
              key={item.label}
              item={item}
              active={active}
              isCollapsed={displayCollapsed}
            />
          );
        })}
      </nav>

      <div
        className="px-6 py-4 text-xs text-center text-white"
        style={{ backgroundColor: '#00377D', color: 'white' }}
      >
        {!displayCollapsed && '© Mbanking-admin 2026'}
      </div>
    </aside>
  );
}