import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineSun, HiOutlineMoon, HiOutlineHeart } from 'react-icons/hi2';
import { HiOutlineSearch, HiMenuAlt3, HiX } from "react-icons/hi";
import { userDataContext } from '../../context/UserContext';
import { shopDataContext } from '../../context/ShopContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userData, logout } = useContext(userDataContext);
  const { getCartCount } = useContext(shopDataContext);
  const { theme, toggleTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const { products } = useContext(shopDataContext);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const filteredProducts = products ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5) : [];

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

          <div className="relative" ref={searchRef}>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-full transition-all ${isSearchOpen ? 'bg-[var(--background-subtle)] text-[var(--brand-primary)]' : 'text-[var(--text-base)] hover:bg-[var(--background-subtle)]'}`}
            >
              {isSearchOpen ? <HiX className="w-5 h-5" /> : <HiOutlineSearch className="w-5 h-5" />}
            </button>
            
            {isSearchOpen && (
              <div className="absolute top-[120%] right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 mt-2 w-[90vw] md:w-[450px] bg-[var(--background-base)]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[var(--border-base)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-4 border-b border-[var(--border-base)] flex items-center gap-3">
                  <HiOutlineSearch className="w-5 h-5 text-[var(--text-muted)]" />
                  <input 
                    type="text" 
                    placeholder="Search for clothes, styles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-[var(--text-muted)]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded-full transition-colors">
                      <HiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {searchQuery && filteredProducts.length === 0 ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                       <span className="text-4xl mb-4">🧊</span>
                       <p className="text-sm font-bold text-[var(--text-base)]">No matches found</p>
                       <p className="text-xs text-[var(--text-muted)] mt-1">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    <div className="p-2">
                    {filteredProducts.map(product => (
                      <Link 
                        key={product._id} 
                        to={`/productdetail/${product._id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--background-subtle)] transition-colors group"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-transparent group-hover:border-[var(--brand-secondary)] transition-colors">
                           <img src={product.image1} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[var(--text-base)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">{product.name}</p>
                          <p className="text-xs font-medium text-[var(--text-muted)] mt-1 tracking-wider uppercase">{product.category}</p>
                        </div>
                        <p className="text-sm font-bold text-[var(--brand-primary)]">₹{product.price}</p>
                      </Link>
                    ))}
                    </div>
                  )}
                  {!searchQuery && (
                    <div className="p-10 flex flex-col items-center justify-center text-center opacity-70">
                       <HiOutlineSearch className="w-8 h-8 text-[var(--text-muted)] mb-3" />
                       <p className="text-sm text-[var(--text-muted)]">Looking for something specific?</p>
                       <div className="flex gap-2 mt-4 text-xs">
                          <span className="px-3 py-1 bg-[var(--background-subtle)] border border-transparent hover:border-[var(--border-base)] rounded-full text-[var(--text-muted)] cursor-pointer hover:text-[var(--brand-primary)] transition-all" onClick={() => setSearchQuery('Men')}>Men</span>
                          <span className="px-3 py-1 bg-[var(--background-subtle)] border border-transparent hover:border-[var(--border-base)] rounded-full text-[var(--text-muted)] cursor-pointer hover:text-[var(--brand-primary)] transition-all" onClick={() => setSearchQuery('Women')}>Women</span>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Link to="/wishlist" className="p-2 text-[var(--text-base)] hover:bg-[var(--background-subtle)] rounded-full transition-all relative">
            <HiOutlineHeart className="w-5 h-5" />
            {userData?.wishlist?.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--brand-primary)] text-[var(--background-base)] text-[10px] font-bold flex items-center justify-center rounded-full">
                {userData.wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="p-2 text-[var(--text-base)] hover:bg-[var(--background-subtle)] rounded-full transition-all relative">
            <HiOutlineShoppingBag className="w-5 h-5" />
            {getCartCount() > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--brand-primary)] text-[var(--background-base)] text-[10px] font-bold flex items-center justify-center rounded-full">
                {getCartCount()}
              </span>
            )}
          </Link>

          {userData ? (
            <div className="hidden md:flex items-center gap-4 border-l border-[var(--border-base)] pl-4 ml-2">
              <Link 
                to="/order"
                className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
              >
                Orders
              </Link>
              <button 
                onClick={logout}
                className="text-sm font-medium text-[var(--text-muted)] hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
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
              <div className="flex flex-col gap-4">
                <Link 
                  to="/order"
                  className="w-full text-left font-medium text-[var(--text-base)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="w-full text-left font-medium text-red-500"
                >
                  Logout
                </button>
              </div>
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
