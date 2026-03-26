"use client";

import React from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { LOGO_URL } from '../config';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  imgClassName?: string;
  showText?: boolean;
  variant?: 'primary' | 'accent' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "flex items-center gap-2 hover:opacity-90 transition-opacity", 
  iconClassName = "w-6 h-6 text-white",
  textClassName = "text-xl font-extrabold tracking-tight text-gray-900",
  imgClassName = "",
  showText = true,
  variant = 'primary',
  size = 'md'
}) => {
  const bgClass = variant === 'primary' ? 'bg-brand-primary' : variant === 'accent' ? 'bg-brand-accent' : 'bg-white';
  const accentTextClass = variant === 'primary' ? 'text-brand-primary' : variant === 'accent' ? 'text-brand-accent' : 'text-white';

  const sizeMap = {
    sm: { img: 'h-8', box: 'w-8 h-8', icon: 'w-5 h-5' },
    md: { img: 'h-12', box: 'w-10 h-10', icon: 'w-6 h-6' },
    lg: { img: 'h-16', box: 'w-12 h-12', icon: 'w-7 h-7' },
    xl: { img: 'h-20', box: 'w-16 h-16', icon: 'w-10 h-10' }
  };

  const currentSize = sizeMap[size];

  const content = LOGO_URL ? (
    <img src={LOGO_URL} alt="Logo" className={`${currentSize.img} object-contain ${imgClassName}`} />
  ) : (
    <>
      <div className={`${currentSize.box} ${bgClass} rounded-lg flex items-center justify-center shadow-lg ${variant === 'primary' ? 'shadow-brand-primary/20' : variant === 'accent' ? 'shadow-brand-accent/20' : ''}`}>
        <Icon name={variant === 'accent' ? 'shield' : 'academicCap'} className={`${currentSize.icon} text-white`} />
      </div>
      {showText && (
        <span className={textClassName}>
          Cortouch <span className={accentTextClass}>Media</span>
        </span>
      )}
    </>
  );

  return (
    <Link href="/" className={className}>
      {content}
    </Link>
  );
};
