"use client";

import Script from "next/script";
import { useEffect } from "react";


export default function PaystackScript() {
  useEffect(() => {
    if (typeof window === "undefined") return;


    const errorHandler = (event: ErrorEvent) => {
      if (event.message?.includes("Paystack Inline javascript file inside of a form")) {
        console.warn("Paystack: no form present on this page — script idle");
        event.preventDefault();
      }
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  return (
    <Script
      src="https://js.paystack.co/v1/inline.js"
      strategy="afterInteractive"
      onLoad={() => console.log("✅ Paystack script loaded")}
      onError={() => console.warn("⚠️ Paystack script failed to load")}
    />
  );
}