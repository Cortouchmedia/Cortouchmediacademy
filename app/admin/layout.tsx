"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../context/AppContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, isHydrated } = useAppContext();

  useEffect(() => {
    // Wait for localStorage rehydration to finish
    if (!isHydrated) return;

    // Not logged in → bounce to login
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    // Logged in but not an admin → bounce to home
    const role = (currentUser.role ?? "").toLowerCase();
    if (role !== "admin" && role !== "superadmin") {
      router.replace("/");
    }
  }, [currentUser, isHydrated, router]);

  // Show nothing while we decide where to send them
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#219BD5]" />
      </div>
    );
  }

  if (!currentUser) return null;

  return <>{children}</>;
}