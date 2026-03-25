"use client";

import React, { useState } from 'react';
import { Icon } from './Icon';
import { Logo } from './Logo';

interface SignUpPageProps {
  onSignUp: (role?: 'admin' | 'student') => void;
  onNavigateToSignIn: () => void;
}

const FormInput: React.FC<{ label: string; type: string; id: string; placeholder: string }> = ({ label, type, id, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-muted mb-2">{label}</label>
        <input 
            type={type} 
            id={id} 
            placeholder={placeholder}
            className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-gray-900 placeholder-brand-muted transition" 
        />
    </div>
);

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onNavigateToSignIn }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Logo size="lg" className="flex justify-center items-center mb-8 gap-2" />

        <div className="bg-brand-surface p-8 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Create Your Account</h2>
            <p className="text-brand-muted text-center mb-6">Start your learning journey today.</p>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <FormInput label="Full Name" type="text" id="name" placeholder="Alex" />
                <FormInput label="Email Address" type="email" id="email" placeholder="alex@cortouch.io" />
                <FormInput label="Password" type="password" id="password" placeholder="••••••••" />
                
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsLoading(true);
                        setTimeout(() => onSignUp('student'), 1500);
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-opacity-80 transition-colors flex justify-center items-center disabled:bg-opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        'Sign Up'
                    )}
                </button>
            </form>
            
            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-sm text-brand-muted">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsLoading(true);
                        setTimeout(() => onSignUp('student'), 1500);
                    }}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-3 px-4 py-3 bg-white text-gray-800 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                         <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <>
                            <Icon name="google" className="w-5 h-5" />
                            Sign Up with Google
                        </>
                    )}
                </button>
                 <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsLoading(true);
                        setTimeout(() => onSignUp('student'), 1500);
                    }}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-3 px-4 py-3 bg-[#1877F2] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <>
                            <Icon name="facebook" className="w-5 h-5" />
                            Sign Up with Facebook
                        </>
                    )}
                </button>
            </div>
        </div>
        <p className="text-center text-brand-muted mt-6 text-sm">
            Already have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToSignIn(); }} className="font-medium text-brand-primary hover:underline">
                Sign In
            </a>
        </p>
      </div>
    </div>
  );
};