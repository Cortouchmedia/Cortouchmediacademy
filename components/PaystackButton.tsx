// components/PaystackButton.tsx
"use client";

import React, { useEffect, useState } from 'react';

interface PaystackButtonProps {
  email: string;
  amount: number;
  onSuccess: (response: { reference: string }) => void;
  onClose: () => void;
  metadata?: Record<string, any>;
}

export const PaystackButton: React.FC<PaystackButtonProps> = ({ 
  email, 
  amount, 
  metadata, 
  onSuccess, 
  onClose 
}) => {
  const [isPaystackReady, setIsPaystackReady] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Check environment variable and Paystack library on mount
  useEffect(() => {
    // Get the key from environment
    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    console.log('🔑 Paystack key from env:', key ? `${key.substring(0, 10)}...` : 'NOT FOUND');
    setPublicKey(key || null);
    
    // Check if Paystack library is loaded
    const checkPaystack = () => {
      if (typeof window !== 'undefined' && window.PaystackPop) {
        console.log('✅ Paystack library loaded');
        setIsPaystackReady(true);
      } else {
        console.log('⏳ Waiting for Paystack library...');
        setTimeout(checkPaystack, 500);
      }
    };
    
    checkPaystack();
  }, []);

  const handlePayment = () => {
    console.log('=== Paystack Payment Attempt ===');
    console.log('Paystack ready:', isPaystackReady);
    console.log('Public key exists:', !!publicKey);
    
    // Check 1: Key exists
    if (!publicKey) {
      console.error('❌ No Paystack public key found in environment variables');
      alert("Paystack API key not found. Please add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to .env.local");
      return;
    }
    
    // Check 2: Key is not the old exposed one
    if (publicKey === 'pk_live_0a18ecbda9801af17e6c38bc759e33225286a4e5') {
      console.error('❌ Using old exposed key - please regenerate in Paystack dashboard');
      alert("Your Paystack key has been compromised and revoked. Please regenerate it in your Paystack dashboard.");
      return;
    }
    
    // Check 3: Paystack library is loaded
    if (typeof window === 'undefined' || !window.PaystackPop) {
      console.error('❌ Paystack library not loaded');
      alert("Payment system is loading. Please refresh the page and try again.");
      return;
    }
    
    console.log('✅ All checks passed! Initializing payment...');
    
    try {
      const reference = `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('📝 Transaction reference:', reference);
      
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: email,
        amount: amount * 100,
        currency: 'NGN',
        ref: reference,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
        onClose: () => {
          console.log('❌ Payment modal closed by user');
          onClose();
        },
        callback: (response: any) => {
          console.log('✅ Payment successful:', response);
          onSuccess(response);
        },
      });

      handler.openIframe();
      console.log('🚀 Payment iframe opened');
      
    } catch (error) {
      console.error('❌ Payment initialization error:', error);
      alert('Unable to initialize payment. Check console for details.');
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={!isPaystackReady || !publicKey}
      className="w-full mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {!publicKey ? '⚠️ Missing API Key' : 
       !isPaystackReady ? 'Loading Payment...' : 
       `Enroll Now - ₦${amount.toLocaleString()}`}
    </button>
  );
};