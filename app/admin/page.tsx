"use client";

import React from "react";
import { useAppContext } from "../../context/AppContext";
import { AdminDashboard } from "../../components/AdminDashboard";

export default function AdminPage() {
  const { currentUser } = useAppContext();

  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "superadmin")) {
    return <div className="p-8 text-center text-gray-500">You do not have permission to view this page.</div>;
  }

 
  return <AdminDashboard />;
}