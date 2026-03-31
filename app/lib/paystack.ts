// lib/paystack.ts
export const paystackConfig = {
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    initializePayment: (options: any) => {
      if (typeof window !== 'undefined' && window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: paystackConfig.publicKey,
          email: options.email,
          amount: options.amount * 100, // Paystack expects amount in kobo
          currency: options.currency || 'NGN',
          ref: options.reference || `ref-${Date.now()}`,
          metadata: options.metadata,
          callback: (response: any) => {
            options.onSuccess?.(response);
          },
          onClose: () => {
            options.onClose?.();
          },
        });
        handler.openIframe();
      } else {
        console.error('PaystackPop is not loaded');
        options.onError?.('Payment system not loaded');
      }
    },
  };