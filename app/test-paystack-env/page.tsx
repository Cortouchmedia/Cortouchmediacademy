// app/test-paystack-env/page.tsx
"use client";

import { useEffect, useState } from 'react';

export default function TestPaystackEnv() {
  const [keyStatus, setKeyStatus] = useState<string>('Checking...');

  useEffect(() => {
    // Check if the key exists
    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    
    if (!key) {
      setKeyStatus('❌ No key found');
    } else if (key === 'pk_live_0a18ecbda9801af17e6c38bc759e33225286a4e5') {
      setKeyStatus('⚠️ Using old revoked key - please update');
    } else {
      setKeyStatus(`✅ Key found (starts with: ${key.substring(0, 10)}...)`);
    }
    
    console.log('Paystack key exists:', !!key);
    console.log('Key prefix:', key?.substring(0, 10));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Paystack Environment Test</h1>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p className="font-mono">Status: {keyStatus}</p>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded">
        <h2 className="font-bold mb-2">Debug Info:</h2>
        <p>Node Environment: {process.env.NODE_ENV}</p>
        <p>Check your .env.local file location:</p>
        <pre className="text-xs mt-2 bg-gray-800 text-white p-2 rounded">
          {process.cwd()}/.env.local
        </pre>
      </div>
    </div>
  );
}