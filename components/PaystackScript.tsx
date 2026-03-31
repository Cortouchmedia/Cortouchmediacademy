// components/PaystackScript.tsx
"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function PaystackScript() {
  useEffect(() => {
    console.log('PaystackScript component mounted');
    
    // Check if script is already loaded
    if (typeof window !== 'undefined' && window.PaystackPop) {
      console.log('✅ Paystack already loaded');
    }
  }, []);

  return (
    <Script
      src="https://js.paystack.co/v1/inline.js"
      strategy="afterInteractive"
      onLoad={() => console.log('✅ Paystack script loaded successfully')}
      onError={(e) => console.error('❌ Failed to load Paystack script:', e)}
    />
  );
}