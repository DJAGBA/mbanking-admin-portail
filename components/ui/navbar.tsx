'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LogOut, UserCircle,ChevronLeft, ChevronRight } from 'lucide-react';
import { removeToken } from '@/lib/tokenUtils';
import { useSidebar } from '@/lib/sidebar-context';

function Navbar() {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const menuRef = useRef<HTMLDivElement>(null);

  // closed when clicking outside or pressing Échap
  useEffect(() => {
    if (!showProfileMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        setShowProfileMenu(false);
      }
    };

    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowProfileMenu(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };
  
  return (
    <nav className="bg-primary text-white px-4 sm:px-6 py-3 flex justify-between items-center border-b border-blue-900">
      {/* Toggle sidebar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 hover:bg-primary hover:text-white rounded-lg transition-colors duration-200"
        aria-label={isCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
        title={isCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
      {/* Menu profil */}
      <div className="relative" ref={menuRef} data-profile-menu>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          aria-expanded={showProfileMenu}
          aria-haspopup="true"
          aria-label="Menu utilisateur"
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center font-bold transition-colors"
        >
          <UserCircle size={20} />
        </button>
        {showProfileMenu && (
          <div
            role="menu"
            aria-label="Menu utilisateur"
            className="absolute right-0 mt-2 bg-white text-gray-800 rounded-xl shadow-xl z-50 min-w-52 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setShowProfileMenu(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <UserCircle size={18} className="text-gray-400" />
              <span className="text-sm">Voir mon profil</span>
            </Link>
            <button
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
            >
              <LogOut size={18} />
              <span className="text-sm">Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;