"use client";

import React from 'react';
import { PAYSTACK_PUBLIC_KEY } from '../config';

interface PaystackButtonProps {
  email: string;
  amount: number; // in Naira
  onSuccess: (response: { reference: string }) => void;
  onClose: () => void;
  metadata?: Record<string, any>;
}

export const PaystackButton: React.FC<PaystackButtonProps> = ({ email, amount, metadata, onSuccess, onClose }) => {
  const handlePayment = () => {
    if (PAYSTACK_PUBLIC_KEY === 'pk_live_0a18ecbda9801af17e6c38bc759e33225286a4e5' || !PAYSTACK_PUBLIC_KEY) {
      alert("Paystack API key not set. Please add your public key to the 'config.ts' file.");
      return;
    }

    if (!window.PaystackPop) {
        alert("Paystack library is not loaded. Please check your internet connection.");
        return;
    }
    
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100, // Paystack amount is in kobo
      currency: 'NGN',
      ref: new Date().getTime().toString(), // Use a unique ref for each transaction
      metadata: metadata || {},
      onClose: onClose,
      callback: onSuccess,
    });

    handler.openIframe();
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full mt-4 px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-opacity-80 transition-all transform hover:scale-105"
    >
      Enroll Now
    </button>
  );
};
