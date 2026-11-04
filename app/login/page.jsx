'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert, RefreshCw } from 'lucide-react';
import { loginUser } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoUrl, setLogoUrl] = useState('/logo.png');

  useEffect(() => {
    try {
      const cached = localStorage.getItem('nh_brand_logo');
      if (cached) setLogoUrl(cached);
    } catch (e) {}

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.settings?.branding?.logoUrl) {
          setLogoUrl(data.settings.branding.logoUrl);
          try {
            localStorage.setItem('nh_brand_logo', data.settings.branding.logoUrl);
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const handleFormLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await loginUser({ 
        email: email.trim(), 
        password 
      });

      if (res.success) {
        // Explicitly set client-side cookie so the browser navigation instantly carries the session
        try {
          document.cookie = `nh_session=${encodeURIComponent(JSON.stringify(res.user))}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (e) {}

        setSuccess(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          // If the user was trying to access /admin but isn't admin, redirect to /
          const target = (redirectTarget.startsWith('/admin') && !res.user.isAdmin) ? '/' : redirectTarget;
          window.location.href = target;
        }, 400);
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={logoUrl || '/logo.png'}
            alt="Naria Holidays"
            className="h-14 w-auto object-contain max-w-[260px]"
            onError={() => setLogoUrl('/logo.png')}
          />
        </div>

        <h2 className="mt-6 text-center text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Naria Holidays
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Social media campaign management & omnichannel automation portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 rounded-3xl sm:px-10 space-y-6">
          {redirectTarget && redirectTarget !== '/' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-2 text-amber-800 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>Authentication required to continue</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Real Credentials Form */}
          <form className="space-y-4" onSubmit={handleFormLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nariaholidays.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
              <span className="text-slate-400 text-[11px]">Secure Sign-In</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Login....' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
