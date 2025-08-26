
"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      const isAuthPage = pathname === '/' || pathname === '/signup';
      const isAdminRoute = pathname.startsWith('/admin');

      if (!user && !isAuthPage && !isAdminRoute) {
        router.push('/');
      }
      
      if (user && user.email !== 'Admin@sys.org' && isAuthPage) {
        router.push('/dashboard');
      }

      if (user && user.email === 'Admin@sys.org' && (isAuthPage || !isAdminRoute)) {
        // This case is handled in the login page, but as a fallback
        // router.push('/admin/dashboard');
      }

    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
