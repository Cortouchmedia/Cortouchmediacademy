"use client";

import React from 'react';
import { Logo } from './Logo';
import { Icon } from './Icon';
import Link from 'next/link';
import { useAppContext } from '../context/AppContext';
import { translations } from '../constants/translations';

export const Footer: React.FC = () => {
  const { language } = useAppContext();
  const t = translations[language];

  return (
    <footer id="about" className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Logo size="lg" />
            </div>
            <p className="text-gray-500 max-w-sm mb-8">
              {t.footerTagline || "Empowering learners worldwide with quality education"}
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#219BD5] transition-colors" aria-label="Facebook">
                <Icon name="facebook" className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#219BD5] transition-colors" aria-label="Instagram">
                <Icon name="instagram" className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#219BD5] transition-colors" aria-label="X (Twitter)">
                <Icon name="xLogo" className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#219BD5] transition-colors" aria-label="TikTok">
                <Icon name="tiktok" className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#219BD5] transition-colors" aria-label="LinkedIn">
                <Icon name="linkedin" className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6">{t.quickLinks || "Quick Links"}</h4>
            <ul className="space-y-4 text-gray-500">
              <li><Link href="/" className="hover:text-[#219BD5] transition-colors">{t.home || "Home"}</Link></li>
              <li><Link href="/courses" className="hover:text-[#219BD5] transition-colors">{t.courses || "Courses"}</Link></li>
              <li><a href="/#features" className="hover:text-[#219BD5] transition-colors">{t.features || "Features"}</a></li>
              <li><a href="/#about" className="hover:text-[#219BD5] transition-colors">{t.aboutUsTitle || "About Us"}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6">{t.contact || "Contact"}</h4>
            <ul className="space-y-4 text-gray-500">
              <li>info@cortouchmedia.com.ng</li>
              <li>+2348067473244</li>
              <li>6th Floor Lister Building<br />Ring Road Ibadan, Oyo State.</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <Logo size="sm" />
            <p>&copy; {new Date().getFullYear()} Cortouch Media, Inc.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="#" className="hover:text-[#219BD5] transition-colors">{t.privacyPolicy || "Privacy Policy"}</a>
            <a href="#" className="hover:text-[#219BD5] transition-colors">{t.termsOfService || "Terms of Service"}</a>
            <a href="#" className="hover:text-[#219BD5] transition-colors">{t.cookieSettings || "Cookie Settings"}</a>
            <a href="#" className="hover:text-[#219BD5] transition-colors">{t.sitemap || "Sitemap"}</a>
            <a href="#" className="hover:text-[#219BD5] transition-colors">{t.accessibilityStatement || "Accessibility"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
