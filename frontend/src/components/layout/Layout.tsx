import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pt-[65px]">
      <Header />
      <div className="flex flex-1 relative min-w-0 overflow-x-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-[calc(100vh-65px)] md:ml-64 transition-all duration-300 min-w-0">
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
