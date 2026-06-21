'use client';

import Sidebar from '@/components/ui/sidebar';
import Navbar from '@/components/ui/navbar';
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context';
// Internal component to manage the layout and state of the dashboard, including the sidebar collapse/expand functionality and rendering the navbar and main content area
function DashboardContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen" suppressHydrationWarning>
      <Sidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
// The main layout component for the admin dashboard, which wraps the content with a sidebar and navbar, and manages the state for the sidebar collapse/expand functionality using a context provider
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}