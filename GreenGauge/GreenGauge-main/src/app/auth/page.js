// src/app/auth/page.js

"use client";
import { useAuth } from '@/app/_components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthPage from '@/app/_components/Auth';

const Auth = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return <AuthPage />;
};

export default Auth;
