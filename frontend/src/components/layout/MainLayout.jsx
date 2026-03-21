import React from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isAuthPage && (
        <footer className="py-12 border-t border-[var(--border-base)] bg-[var(--background-subtle)]">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4 tracking-tight">VELVIERA</h3>
            <p className="text-[var(--text-muted)] text-sm max-w-sm leading-relaxed">
              Premium essentials for the modern lifestyle. Re-imagined with a focus on quality, sustainability, and minimal design.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3 text-sm text-[var(--text-muted)]">
              <li><a href="/collection" className="hover:text-[var(--brand-primary)] transition-colors">All Collections</a></li>
              <li><a href="/collection?category=mens" className="hover:text-[var(--brand-primary)] transition-colors">Men's Wear</a></li>
              <li><a href="/collection?category=womens" className="hover:text-[var(--brand-primary)] transition-colors">Women's Wear</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-[var(--text-muted)]">
              <li><a href="/about" className="hover:text-[var(--brand-primary)] transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-[var(--brand-primary)] transition-colors">Contact</a></li>
              <li><a href="/privacy" className="hover:text-[var(--brand-primary)] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-[var(--border-base)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} Velviera. All rights reserved.
          </p>
          <div className="flex gap-6 text-[var(--text-muted)]">
             {/* Add social links here if needed */}
          </div>
        </div>
      </footer>
      )}
    </div>
  );
};

export default MainLayout;
