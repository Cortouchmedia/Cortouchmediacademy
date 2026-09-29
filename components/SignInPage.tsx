"use client";

import React, { useState } from 'react';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../context/AppContext';

const FormInput: React.FC<{
  label: string;
  type: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ label, type, id, placeholder, value, onChange, disabled }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-brand-muted mb-2"
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-gray-900 placeholder-brand-muted transition disabled:opacity-60"
    />
  </div>
);

export const SignInPage: React.FC = () => {
  const { handleLogin } = useAppContext();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log('🔵 onSignIn fired', { email });

    try {
      const result = await handleLogin(email, password);
      console.log('🟢 handleLogin result:', result);

      if (!result.success) {
        setError(result.error ?? 'Sign in failed');
        setIsLoading(false);
        return;
      }

      // Read user we just saved in localStorage
      const userStr = typeof window !== 'undefined'
        ? localStorage.getItem('auth_user')
        : null;
      const user = userStr ? JSON.parse(userStr) : null;
      const role = user?.role ?? 'student';

      console.log('🟡 redirecting with role:', role);

      if (role === 'instructor') router.push('/instructor-dashboard');
      else if (role === 'admin') router.push('/admin');
      else router.push('/student-dashboard');
    } catch (err) {
      console.error('🔴 onSignIn error:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
      setIsLoading(false);
    }
  };

  const onNavigateToSignUp = () => router.push('/signup');

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Logo size="lg" className="flex justify-center items-center mb-8 gap-2" />

        <div className="bg-brand-surface p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Welcome Back!
          </h2>
          <p className="text-brand-muted text-center mb-6">
            Sign in to continue your learning journey.
          </p>

          <form className="space-y-6" onSubmit={onSignIn}>
            <FormInput
              label="Email Address"
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              disabled={isLoading}
            />
            <FormInput
              label="Password"
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              disabled={isLoading}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full px-4 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-opacity-80 transition-colors flex justify-center items-center disabled:bg-opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300" />
            <span className="flex-shrink mx-4 text-sm text-brand-muted">OR</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          <div className="space-y-4">
            <button
              type="button"
              disabled
              className="w-full flex justify-center items-center gap-3 px-4 py-3 bg-white text-gray-400 font-semibold rounded-lg border border-gray-300 cursor-not-allowed opacity-60"
              title="Google OAuth coming soon"
            >
              <Icon name="google" className="w-5 h-5" />
              Sign In with Google (coming soon)
            </button>
            <button
              type="button"
              disabled
              className="w-full flex justify-center items-center gap-3 px-4 py-3 bg-[#1877F2] text-white font-semibold rounded-lg cursor-not-allowed opacity-60"
              title="Facebook OAuth coming soon"
            >
              <Icon name="facebook" className="w-5 h-5" />
              Sign In with Facebook (coming soon)
            </button>
          </div>
        </div>

        <p className="text-center text-brand-muted mt-6 text-sm">
          Don&apos;t have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToSignUp();
            }}
            className="font-medium text-brand-primary hover:underline"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};