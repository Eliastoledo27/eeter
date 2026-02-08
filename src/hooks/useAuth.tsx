'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { User, Role } from '@/types';
import { useRouter } from 'next/navigation';
import { logoutAction, bypassLogin } from '@/app/actions/auth-bypass';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: Role) => Promise<void>;
  setRealUser: (user: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('eter_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: Role) => {
    const newUser: User = {
      id: role === 'admin' ? 'admin-1' : 'user-1',
      email,
      name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
      role,
      avatar_url: `https://ui-avatars.com/api/?name=${role}&background=random`
    };

    try {
      await bypassLogin();
    } catch (error) {
      console.error('Bypass login failed:', error);
    }

    localStorage.setItem('eter_user', JSON.stringify(newUser));
    // Set dev bypass cookie for server actions
    // document.cookie = "eter_dev_session=true; path=/"; // Handled by server action now

    setUser(newUser);

    // Role-based redirection
    const redirectParams = new URLSearchParams();
    if (role === 'admin') redirectParams.set('view', 'admin');
    else if (role === 'reseller') redirectParams.set('view', 'reseller');
    else if (role === 'support') redirectParams.set('view', 'support');
    // 'user' goes to default dashboard logic which might just be /dashboard without params or with default view

    const queryString = redirectParams.toString();
    const targetUrl = queryString ? `/dashboard?${queryString}` : '/dashboard';

    router.push(targetUrl);
    router.refresh();
  };

  const setRealUser = (user: User) => {
    localStorage.setItem('eter_user', JSON.stringify(user));
    setUser(user);

    // Role-based redirection
    const redirectParams = new URLSearchParams();
    if (user.role === 'admin') redirectParams.set('view', 'admin');
    else if (user.role === 'reseller') redirectParams.set('view', 'reseller');
    else if (user.role === 'support') redirectParams.set('view', 'support');

    const queryString = redirectParams.toString();
    const targetUrl = queryString ? `/dashboard?${queryString}` : '/dashboard';

    router.push(targetUrl);
    router.refresh();
  };

  const logout = async () => {
    try {
      await logoutAction();
    } catch {
      // console.error('Logout action failed:', error);
    }

    localStorage.removeItem('eter_user');
    // Clear cookies client-side as well just to be safe
    document.cookie = "eter_dev_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "eter_dev_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    setUser(null);
    router.push('/login');
    router.refresh(); // Force refresh to ensure server components update
  };

  return (
    <AuthContext.Provider value={{ user, login, setRealUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
