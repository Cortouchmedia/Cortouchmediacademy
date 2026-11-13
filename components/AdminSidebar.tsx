"use client";

import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { usePathname, useRouter } from 'next/navigation';
import { authStorage, ApiRevenue } from '../lib/api';

interface AdminSidebarProps {
  user: User;
  onLogout: () => void;
}

const NavLink: React.FC<{
  iconName: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}> = ({ iconName, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-brand-accent text-white shadow-md'
        : 'text-brand-muted hover:bg-brand-accent/10 hover:text-brand-accent'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon name={iconName} className="w-6 h-6" />
      <span className="font-semibold">{label}</span>
    </div>
    
    {/* Render the red badge if count > 0 */}
    {badge !== undefined && badge > 0 && (
      <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
        isActive ? 'bg-white text-brand-accent' : 'bg-red-500 text-white'
      }`}>
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, onLogout }) => {
  const pathname = usePathname();
  const router = useRouter();

  // State to hold the number of pending payouts
  const [pendingPayouts, setPendingPayouts] = useState(0);

  // Fetch the pending payouts count
  useEffect(() => {
    const fetchPendingPayouts = async () => {
      const token = authStorage.getToken();
      if (!token) return;

      try {
        const res = await ApiRevenue.allPayouts(token, 'pending');
        setPendingPayouts(res?.payouts?.length || 0);
      } catch (err) {
        console.error("Failed to load pending payouts for sidebar", err);
      }
    };

    fetchPendingPayouts();
    
    // Optional: Refresh the count every 60 seconds
    const interval = setInterval(fetchPendingPayouts, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Admin Dashboard', icon: 'dashboard', path: '/admin' },
    { label: 'Manage Courses', icon: 'courses', path: '/admin/courses' },
    { label: 'Manage Users', icon: 'community', path: '/admin/users' },
    { label: 'Manage Students', icon: 'academicCap', path: '/admin/students' }, // 👈 ADDED HERE
    { label: 'Earnings', icon: 'trendingUp', path: '/admin/earnings' },
    { label: 'Payouts', icon: 'creditCard', path: '/admin/payouts', badge: pendingPayouts },
    { label: 'Audit Log', icon: 'settings', path: '/admin/audit-log' },
    { label: 'Reports', icon: 'trendingUp', path: '/admin/reports' },
  ];

  return (
    <aside className="bg-brand-surface w-64 min-h-screen flex flex-col p-4 border-r border-gray-200">
      <div className="flex items-center space-x-2 mb-10 px-2">
         <Logo variant="accent" size="lg" />
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            iconName={item.icon}
            label={item.label}
            isActive={pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path + '/'))}
            onClick={() => router.push(item.path)}
            badge={item.badge}
          />
        ))}
      </nav>
      
      <div className="space-y-2 border-t border-gray-200 pt-4 mt-4">
        <NavLink
          iconName="user"
          label="My Profile"
          isActive={pathname === '/profile'}
          onClick={() => router.push('/profile')}
        />
        <NavLink
          iconName="logout"
          label="Back to Academy"
          isActive={false}
          onClick={() => router.push('/student-dashboard')}
        />
        <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-brand-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
            <Icon name="logout" className="w-6 h-6" />
            <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};