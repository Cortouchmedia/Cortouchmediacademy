
"use client";

import React, { useEffect, useState } from 'react';

interface PaystackButtonProps {
  email: string;
  amount: number;
  onSuccess: (response: { reference: string }) => void;
  onClose: () => void;
  metadata?: Record<string, any>;
}

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

const PAYSTACK_SCRIPT_ID = 'paystack-inline-js';
const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v1/inline.js';

export const PaystackButton: React.FC<PaystackButtonProps> = ({
  email,
  amount,
  metadata,
  onSuccess,
  onClose,
}) => {
  const [isPaystackReady, setIsPaystackReady] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  // Load env key
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? null;
    if (typeof window !== 'undefined') {
      console.log(
        '🔑 Paystack key:',
        key ? `${key.substring(0, 10)}... (${key.length} chars)` : 'NOT FOUND',
      );
    }
    setPublicKey(key);
  }, []);

  // Load Paystack script dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Already loaded?
    if (window.PaystackPop) {
      setIsPaystackReady(true);
      return;
    }

    // Already injected by us or elsewhere?
    let script = document.getElementById(PAYSTACK_SCRIPT_ID) as HTMLScriptElement | null;

    const onLoad = () => setIsPaystackReady(true);
    const onError = () => setInitError('Failed to load Paystack script');

    if (script) {
      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);
      return () => {
        script?.removeEventListener('load', onLoad);
        script?.removeEventListener('error', onError);
      };
    }

    script = document.createElement('script');
    script.id = PAYSTACK_SCRIPT_ID;
    script.src = PAYSTACK_SCRIPT_SRC;
    script.async = true;
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    document.body.appendChild(script);

    return () => {
      script?.removeEventListener('load', onLoad);
      script?.removeEventListener('error', onError);
    };
  }, []);

  const handlePayment = () => {
    if (!publicKey) {
      alert(
        'Paystack public key not configured. Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to .env.local and restart the dev server.',
      );
      return;
    }

    if (!window.PaystackPop) {
      alert('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    try {
      const reference = `ref-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: Math.round(amount * 100), // kobo
        currency: 'NGN',
        ref: reference,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
        onClose: () => onClose(),
        callback: (response: any) => onSuccess(response),
      });

      handler.openIframe();
    } catch (err: any) {
      console.error('Paystack init failed:', err);
      alert(err?.message || 'Unable to open payment. Check the console.');
    }
  };

  // Determine button state
  const missingKey = !publicKey;
  const scriptFailed = !!initError;
  const loading = !isPaystackReady && !scriptFailed && !missingKey;

  const label = missingKey
    ? '⚠ Payment Not Configured'
    : scriptFailed
      ? '⚠ Payment Unavailable'
      : loading
        ? 'Loading Payment…'
        : `Enroll Now — ₦${amount.toLocaleString()}`;

  const disabled = missingKey || scriptFailed || loading;

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={disabled}
      className="w-full px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
};