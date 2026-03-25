"use client";

import React, { useState } from 'react';
import { Icon } from './Icon';
import { Logo } from './Logo';

interface AdminSignInPageProps {
  onSignIn: (role?: 'admin' | 'student') => void;
}

const FormInput: React.FC<{ label: string; type: string; id: string; placeholder: string }> = ({ label, type, id, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-muted mb-2">{label}</label>
        <input 
            type={type} 
            id={id} 
            placeholder={placeholder}
            className="w-full bg-brand-bg border border-gray-300 focus:border-brand-accent focus:ring-0 rounded-lg py-2 px-4 text-gray-900 placeholder-brand-muted transition" 
        />
    </div>
);

export const AdminSignInPage: React.FC<AdminSignInPageProps> = ({ onSignIn }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onSignIn('admin');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Logo variant="accent" size="lg" className="flex justify-center items-center mb-8 gap-2" />

        <div className="bg-brand-surface p-8 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Admin Login</h2>
            <p className="text-brand-muted text-center mb-6">Secure access to Cortouch Media Academy management.</p>
            <form className="space-y-6" onSubmit={handleAdminLogin}>
                <FormInput label="Admin Email" type="email" id="email" placeholder="admin@cortouch.io" />
                <FormInput label="Password" type="password" id="password" placeholder="••••••••" />
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-opacity-80 transition-colors flex justify-center items-center disabled:bg-opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        'Access Admin Portal'
                    )}
                </button>
            </form>
            
            <div className="mt-6 text-center">
                <a href="/" className="text-sm text-brand-muted hover:text-brand-accent transition-colors">
                    Back to Main Site
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};
