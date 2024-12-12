// src/app/_components/ProtectedRoute.jsx

"use client";
import { useAuth } from '@/app/_components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  return user ? children : null;
};

export default ProtectedRoute;
