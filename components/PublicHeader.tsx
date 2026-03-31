"use client";

import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAppContext } from '../context/AppContext';
import { translations } from '../constants/translations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '../types';

interface PublicHeaderProps {
  user?: User | null;
  onNavigateToSignIn?: () => void;
  onNavigateToSignUp?: () => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  scrolledEffect?: boolean;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  user,
  onNavigateToSignIn,
  onNavigateToSignUp,
  searchQuery = "",
  onSearch,
  scrolledEffect = false,
}) => {
  const { language } = useAppContext();
  const t = translations[language];
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!scrolledEffect) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolledEffect]);

  const handleSignIn = () => {
    if (onNavigateToSignIn) onNavigateToSignIn();
    else router.push('/login');
  };

  const handleSignUp = () => {
    if (onNavigateToSignUp) onNavigateToSignUp();
    else router.push('/signup');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-3 flex items-center gap-4 lg:gap-8">
        <Logo size="md" />
        
        {onSearch && (
          <div className="flex-1 max-w-2xl relative hidden md:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon name="search" className="w-4 h-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder={t.searchAnything || "Search for courses..."} 
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-[#219BD5] rounded-full py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Link 
            href="/"
            className="hidden sm:block px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#219BD5]"
          >
            {t.home || "Home"}
          </Link>
          <Link 
            href="/courses"
            className="hidden sm:block px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#219BD5]"
          >
            {t.courses || "Courses"}
          </Link>
          
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <img 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=219BD5&color=fff`}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.name}</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleSignIn}
                className="px-4 py-2 text-sm font-bold text-[#219BD5] border border-[#219BD5] hover:bg-[#219BD5]/10 transition-colors"
              >
                {t.login}
              </button>
              <button
                onClick={handleSignUp}
                className="px-4 py-2 bg-[#219BD5] text-white text-sm font-bold hover:bg-[#1a7fb0] transition-all"
              >
                {t.signup}
              </button>
            </>
          )}
          <LanguageSwitcher showLabel={false} />
        </div>
      </div>
    </header>
  );
};
