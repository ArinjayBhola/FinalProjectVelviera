import React, { useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { HiOutlineSearch, HiMenuAlt3, HiX } from "react-icons/hi";
import { userDataContext } from '../../context/UserContext';
import { shopDataContext } from '../../context/ShopContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userData, logout } = useContext(userDataContext);
  const { cartCount } = useContext(shopDataContext);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collection', path: '/collection' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--background-base)]/80 backdrop-blur-md border-b border-[var(--border-base)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight text-[var(--brand-primary)]">
          VELVIERA
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-[var(--brand-primary)] ${
                  isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-muted)]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <button 
            onClick={toggleTheme}
            className="p-2 text-[var(--text-base)] hover:bg-[var(--background-subtle)] rounded-full transition-all"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <HiOutlineMoon className="w-5 h-5" /> : <HiOutlineSun className="w-5 h-5" />}
          </button>

          <button className="p-2 text-[var(--text-base)] hover:bg-[var(--background-subtle)] rounded-full transition-all">
            <HiOutlineSearch className="w-5 h-5" />
          </button>
          
          <Link to="/cart" className="p-2 text-[var(--text-base)] hover:bg-[var(--background-subtle)] rounded-full transition-all relative">
            <HiOutlineShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--brand-primary)] text-[var(--background-base)] text-[10px] font-bold flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {userData ? (
            <button 
              onClick={logout}
              className="hidden md:block text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)]"
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login"
              className="hidden md:block text-sm font-medium text-[var(--brand-primary)]"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-[var(--text-base)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenuAlt3 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[var(--background-base)] border-b border-[var(--border-base)] py-4 px-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className="text-lg font-medium text-[var(--text-base)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
          <div className="pt-4 border-t border-[var(--border-base)]">
             {userData ? (
              <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="w-full text-left font-medium text-red-500"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login"
                className="w-full text-left font-medium text-[var(--brand-primary)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
