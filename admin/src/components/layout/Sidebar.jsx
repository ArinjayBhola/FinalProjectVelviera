import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { HiOutlineHome, HiOutlinePlusCircle, HiOutlineListBullet, HiOutlineShoppingBag, HiArrowRightOnRectangle, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { adminDataContext } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = () => {
  const { logout } = useContext(adminDataContext);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: HiOutlineHome },
    { name: 'Add Product', path: '/add', icon: HiOutlinePlusCircle },
    { name: 'Product List', path: '/lists', icon: HiOutlineListBullet },
    { name: 'Orders', path: '/orders', icon: HiOutlineShoppingBag },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--background-base)] border-r border-[var(--border-base)] flex flex-col pt-8">
      <div className="px-6 mb-10">
        <Link to="/" className="text-xl font-bold tracking-tight text-[var(--brand-primary)]">
          VELVIERA <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] bg-[var(--background-subtle)] px-2 py-0.5 rounded">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-soft transition-colors ${
                isActive 
                  ? 'bg-[var(--brand-primary)] text-[var(--background-base)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:bg-[var(--background-subtle)]'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border-base)] flex flex-col gap-2">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:bg-[var(--background-subtle)] rounded-soft transition-colors"
        >
          {theme === 'light' ? <HiOutlineMoon className="w-5 h-5" /> : <HiOutlineSun className="w-5 h-5" />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-soft transition-colors"
        >
          <HiArrowRightOnRectangle className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
