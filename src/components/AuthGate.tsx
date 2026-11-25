import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { AssetTrackProvider } from '../context/AssetTrackContext';
import { isSupabaseConfigured, mapProfileToUser, supabase } from '../lib/supabase';
import type { User } from '../types';

const panelClass = 'w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl';

const AuthMessage: React.FC<{ title: string; message: string; children?: React.ReactNode }> = ({ title, message, children }) => (
  <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
    <section className={panelClass}>
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      {children}
    </section>
  </main>
);

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const client = supabase;

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!client) return;
    setBusy(true);
    setError('');
    setMessage('');
    const { error: authError } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError(authError.message);
    setBusy(false);
  };

  const sendPasswordReset = async () => {
    if (!client || !email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setBusy(true);
    setError('');
    const { error: resetError } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (resetError) setError(resetError.message);
    else setMessage('Password reset instructions have been sent if that account exists.');
    setBusy(false);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
      <section className={panelClass}>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">AssetTrack</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">Use the email and password from your AssetTrack invitation.</p>
        </div>
        <form onSubmit={signIn} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <div className="relative mt-1.5">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? 'Please wait…' : 'Sign in'}
          </button>
          <button type="button" onClick={sendPasswordReset} disabled={busy} className="w-full py-1 text-sm font-medium text-blue-700 hover:text-blue-900">
            Forgot password?
          </button>
        </form>
        <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
          Accounts are created by an AssetTrack administrator. Contact your administrator if you need an invitation.
        </p>
      </section>
    </main>
  );
};

const InvitePasswordSetup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const setNewPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else {
      window.history.replaceState({}, document.title, window.location.pathname);
      onComplete();
    }
    setBusy(false);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
      <section className={panelClass}>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">AssetTrack invitation</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Set your password</h1>
        <p className="mt-2 text-sm text-slate-600">Choose a password to activate your account.</p>
        <form onSubmit={setNewPassword} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            New password
            <div className="relative mt-1.5">
              <input type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirm password
            <div className="relative mt-1.5">
              <input type={showConfirmPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm" />
              <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} aria-pressed={showConfirmPassword} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800">
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {busy ? 'Saving…' : 'Activate account'}
          </button>
        </form>
      </section>
    </main>
  );
};

export const AuthGate: React.FC<{ children: (user: User, signOut: () => Promise<void>) => React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [profileError, setProfileError] = useState('');
  const [passwordReady, setPasswordReady] = useState(false);
  const [passwordSetupType, setPasswordSetupType] = useState<'invite' | 'recovery' | null>(() => {
    const urlType = new URLSearchParams(window.location.hash.slice(1)).get('type');
    if (urlType === 'invite' || urlType === 'recovery') return urlType;
    return new URLSearchParams(window.location.search).has('code') ? 'invite' : null;
  });

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setInitializing(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordSetupType('recovery');
      setSession(nextSession);
      setProfile(null);
      setProfileError('');
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client || !session?.user.id) {
      setProfile(null);
      return;
    }
    let isMounted = true;
    const loadProfile = async () => {
      const { data, error } = await client
        .from('profiles')
        .select('id,email,full_name,role,title,department_id,avatar,phone,portal')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!isMounted) return;
      if (error || !data) {
        setProfileError(error?.message || 'Your profile is not set up yet. Ask an administrator to check the Supabase migration and your account.');
        return;
      }
      setProfile(mapProfileToUser(data));
    };
    loadProfile();
    return () => { isMounted = false; };
  }, [session?.user.id]);

  if (!isSupabaseConfigured || !supabase) {
    return <AuthMessage title="Connect AssetTrack" message="Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the Vercel project environment variables, then redeploy." />;
  }
  const client = supabase;
  if (initializing) {
    return <AuthMessage title="AssetTrack" message="Checking your account…" />;
  }
  if (!session) return <SignIn />;
  if (passwordSetupType && !passwordReady) {
    return <InvitePasswordSetup onComplete={() => setPasswordReady(true)} />;
  }
  if (profileError) {
    return (
      <AuthMessage title="Account setup incomplete" message={profileError}>
        <button onClick={() => { void client.auth.signOut(); }} className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Sign out</button>
      </AuthMessage>
    );
  }
  if (!profile) return <AuthMessage title="AssetTrack" message="Loading your account…" />;

  return <AssetTrackProvider currentUser={profile} onProfileUpdated={setProfile}>{children(profile, async () => { await client.auth.signOut(); })}</AssetTrackProvider>;
};
