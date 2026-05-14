import { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pt-[65px]">
      <Header />
      <div className="flex flex-1 relative min-w-0 overflow-x-hidden">
        <Sidebar
          collapsed={isSidebarCollapsed}
        />

        {/* Toggle handle (siempre visible). En desktop se coloca en el borde del panel. */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(v => !v)}
          aria-label={isSidebarCollapsed ? 'Mostrar panel lateral' : 'Ocultar panel lateral'}
          title={isSidebarCollapsed ? 'Mostrar panel' : 'Ocultar panel'}
          className={`hidden md:flex fixed top-[calc(65px+(100vh-65px)/2)] left-0 -translate-y-1/2 h-24 w-4 items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors transition-transform duration-300 ease-in-out z-50 rounded-r-lg ${isSidebarCollapsed ? 'translate-x-0' : 'translate-x-64'}`}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Toggle handle en móvil (drawer). */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(v => !v)}
          aria-label={isSidebarCollapsed ? 'Mostrar panel lateral' : 'Ocultar panel lateral'}
          title={isSidebarCollapsed ? 'Mostrar panel' : 'Ocultar panel'}
          className={`md:hidden fixed top-[calc(65px+(100vh-65px)/2)] left-0 -translate-y-1/2 h-24 w-4 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors transition-transform duration-300 ease-in-out z-50 rounded-r-lg ${isSidebarCollapsed ? 'translate-x-0' : 'translate-x-64'}`}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        <div
          className={`flex-1 flex flex-col min-h-[calc(100vh-65px)] min-w-0 transition-[margin] duration-300 ${isSidebarCollapsed ? 'md:ml-0' : 'md:ml-64'}`}
        >
          <main className="flex-1 p-4 md:p-6 mb-16 min-w-0">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
