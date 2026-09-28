"use client";

import { useEffect, useState } from 'react';

export default function TestPaystackEnv() {
  const [keyStatus, setKeyStatus] = useState<string>('Checking...');
  const [nodeEnv, setNodeEnv] = useState<string>('');
  const [cwd, setCwd] = useState<string>('');

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!key) {
      setKeyStatus('❌ No key found');
    } else {
      setKeyStatus(`✅ Key found (starts with: ${key.substring(0, 10)}...)`);
    }

    setNodeEnv(process.env.NODE_ENV ?? 'unknown');

    fetch('/api/check-paystack-key')
      .then((r) => r.json())
      .then((data) => setCwd(`${data.nodeEnv}`))
      .catch(() => setCwd('unavailable'));

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
        <p>Node Environment: {nodeEnv || '...'}</p>
        <p>Key prefix: {keyStatus}</p>
      </div>
    </div>
  );
}