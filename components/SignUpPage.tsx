"use client";

import React, { useState } from 'react';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import { Api, ApiError, authStorage } from '@/lib/api';

interface SignUpPageProps {
  role?: 'admin' | 'student' | 'instructor';
}

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

export const SignUpPage: React.FC<SignUpPageProps> = () => {
  const { handleLogin } = useAppContext();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create the account
      const result = await Api.auth.signup({
        email,
        password,
        full_name: fullName.trim(),
        role: role === 'instructor' ? 'INSTRUCTOR' : 'STUDENT',
      });

      const user = (result as any)?.user;
      const session = (result as any)?.session;

      // Email confirmation required → no session yet
      if (!session && user) {
        setSuccess(
          'Account created! Please check your email to confirm before signing in.',
        );
        setIsLoading(false);
        return;
      }

      // 2. Sign in with the new credentials
      const loginResult = await handleLogin(email, password);

      if (!loginResult.success) {
        setError(loginResult.error ?? 'Signup succeeded but auto-login failed');
        setIsLoading(false);
        return;
      }

      // 3. Redirect based on role
      const userStr = typeof window !== 'undefined'
        ? localStorage.getItem('auth_user')
        : null;
      const storedUser = userStr ? JSON.parse(userStr) : null;
      const userRole = storedUser?.role ?? 'student';

      if (userRole === 'instructor') router.push('/instructor-dashboard');
      else if (userRole === 'admin') router.push('/admin');
      else router.push('/student-dashboard');
    } catch (err) {
      console.error('signup error:', err);
      if (err instanceof ApiError) {
        setError(err.message || 'Signup failed');
      } else {
        setError('Network error. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      setError(null);
      setOauthLoading(provider);
      
      // Import the Supabase client directly
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce', // 👈 Forces PKCE
            detectSessionInUrl: true,
          }
        }
      );

      const redirectTo = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
      
    } catch (err: any) {
      console.error(`${provider} login failed`, err);
      setError(err?.message || `Could not connect to ${provider}. Please try again.`);
      setOauthLoading(null);
    }
  };

  const onNavigateToSignIn = () => router.push('/login');

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Logo size="lg" className="flex justify-center items-center mb-8 gap-2" />

        <div className="bg-brand-surface p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Create Your Account
          </h2>
          <p className="text-brand-muted text-center mb-6">
            Start your learning journey today.
          </p>

          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              disabled={isLoading || !!oauthLoading}
              className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${
                role === 'student'
                  ? 'bg-[#219BD5] text-white border-[#219BD5]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#219BD5] hover:text-[#219BD5]'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('instructor')}
              disabled={isLoading || !!oauthLoading}
              className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${
                role === 'instructor'
                  ? 'bg-[#219BD5] text-white border-[#219BD5]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#219BD5] hover:text-[#219BD5]'
              }`}
            >
              Instructor
            </button>
          </div>

          <form className="space-y-6" onSubmit={onSignUp}>
            <FormInput
              label="Full Name"
              type="text"
              id="name"
              placeholder="Alex Morgan"
              value={fullName}
              onChange={setFullName}
              disabled={isLoading || !!oauthLoading}
            />
            <FormInput
              label="Email Address"
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              disabled={isLoading || !!oauthLoading}
            />
            <FormInput
              label="Password"
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              disabled={isLoading || !!oauthLoading}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !!oauthLoading || !email || !password || !fullName}
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
                `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`
              )}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300" />
            <span className="flex-shrink mx-4 text-sm text-brand-muted">OR</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          <div className="space-y-4">
            {/* 👈 Google Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading || !!oauthLoading}
              className="w-full flex justify-center items-center gap-3 px-4 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
                className="w-5 h-5" 
              />
              {oauthLoading === 'google' ? 'Connecting...' : 'Sign Up with Google'}
            </button>

            {/* 👈 Facebook Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('facebook')}
              disabled={isLoading || !!oauthLoading}
              className="w-full flex justify-center items-center gap-3 px-4 py-3 bg-[#1877F2] text-white font-semibold rounded-lg hover:bg-[#166fe5] transition-colors disabled:opacity-60"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {oauthLoading === 'facebook' ? 'Connecting...' : 'Sign Up with Facebook'}
            </button>
          </div>
        </div>

        <p className="text-center text-brand-muted mt-6 text-sm">
          Already have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToSignIn();
            }}
            className="font-medium text-brand-primary hover:underline"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};