"use client";

import Image from "next/image";
import Navbar from "@/app/_components/Navbar";
import Devices from "@/app/_components/Devices";
import ProtectedRoute from '@/app/_components/ProtectedRoute';
import { useAuth } from '@/app/_components/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <Navbar user={user} />
        <Devices/>
      </div>
    </ProtectedRoute>
  );
}
