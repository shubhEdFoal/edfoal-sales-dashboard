'use client';

import {
  BriefcaseBusiness,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  UserRound,
  Zap,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { GlowButton } from '@/components/ui/GlowButton';
import {
  DASHBOARD_USER_NAME_STORAGE_KEY,
  getDisplayNameFromAuthResponse,
} from '@/lib/auth/display-name';
import { cn } from '@/lib/utils';

const FIELD_CLS =
  'w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-800 shadow-sm backdrop-blur placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/15';
const FIELD_ICON_CLS =
  'absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-600';

type AuthMode = 'signin' | 'signup' | 'otp';

interface AuthResponse {
  ok?: boolean;
  success?: boolean;
  error?: string;
  message?: string;
  email?: string;
  firstName?: string;
  first_name?: string;
  fullName?: string;
  full_name?: string;
  name?: string;
  profile?: {
    firstName?: string;
    first_name?: string;
    fullName?: string;
    full_name?: string;
    name?: string;
  };
  user?: {
    email?: string;
    firstName?: string;
    first_name?: string;
    fullName?: string;
    full_name?: string;
    name?: string;
  };
}

function responseMessage(data: AuthResponse, fallback: string) {
  return data.message ?? data.error ?? fallback;
}

function isInvalidLogin(message: string) {
  return message.toLowerCase().includes('invalid email or password');
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/';

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('shubham@edfoal.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Shubham');
  const [position, setPosition] = useState('Founder');
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setNotice(null);
    setShowSignupPrompt(false);
  }

  async function parseAuthResponse(res: Response) {
    return (await res.json().catch(() => ({}))) as AuthResponse;
  }

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setShowSignupPrompt(false);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseAuthResponse(res);

      if (!res.ok || data.success === false) {
        const message = responseMessage(data, 'Login failed. Please try again.');
        setError(message);
        setShowSignupPrompt(isInvalidLogin(message));
        return;
      }

      window.localStorage.setItem(
        DASHBOARD_USER_NAME_STORAGE_KEY,
        getDisplayNameFromAuthResponse(data, email)
      );
      router.replace(from.startsWith('/') ? from : '/');
      router.refresh();
    } catch {
      setError('Authentication server is not reachable.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, position, email, password }),
      });
      const data = await parseAuthResponse(res);

      if (!res.ok || data.success === false) {
        setError(responseMessage(data, 'Signup failed. Please try again.'));
        return;
      }

      const nextEmail = data.email?.trim() || email.trim();
      setOtpEmail(nextEmail);
      setEmail(nextEmail);
      setOtp('');
      setNotice(responseMessage(data, 'OTP sent to your email.'));
      setMode('otp');
    } catch {
      setError('Authentication server is not reachable.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail || email, otp }),
      });
      const data = await parseAuthResponse(res);

      if (!res.ok || data.success === false) {
        setError(responseMessage(data, 'OTP verification failed. Please try again.'));
        return;
      }

      setNotice(responseMessage(data, 'Email verified successfully. Please sign in.'));
      setMode('signin');
      setOtp('');
    } catch {
      setError('Authentication server is not reachable.');
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Verify OTP';
  const eyebrow =
    mode === 'signin' ? 'Secure Login' : mode === 'signup' ? 'EdFoal Signup' : 'Email OTP';
  const description =
    mode === 'signin'
      ? 'Use your EdFoal email and password to continue.'
      : mode === 'signup'
        ? 'Create your EdFoal account. Only EdFoal email addresses are allowed.'
        : `Enter the OTP sent to ${otpEmail || email}.`;

  return (
    <main className="mesh-bg grid min-h-screen place-items-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-white/60 bg-white/55 shadow-2xl shadow-indigo-600/10 backdrop-blur-[28px] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[660px] overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-500 to-violet-600 p-10 text-white lg:block">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-400/30 blur-3xl" />
          <div className="absolute -bottom-28 left-10 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="animate-float flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur">
              <Zap className="h-7 w-7" />
            </div>

            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Premium Dashboard
              </p>
              <h1 className="max-w-md text-5xl font-extrabold tracking-tight">
                Welcome back to EdFoal.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                Sign in, sign up, and verify your EdFoal email before opening the sales
                automation dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mx-auto flex max-w-md flex-col justify-center py-8 lg:min-h-[660px]">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-600/20 lg:hidden">
                <Zap className="h-6 w-6" />
              </div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.24em] text-indigo-600">
                {eyebrow}
              </p>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-950">
                {title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{description}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/60 bg-white/45 p-1 backdrop-blur">
              {(['signin', 'signup'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchMode(item)}
                  className={cn(
                    'rounded-xl px-3 py-2 text-sm font-bold transition-all',
                    mode === item
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-500 hover:bg-white/70 hover:text-indigo-600'
                  )}
                >
                  {item === 'signin' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>

            {mode === 'signin' && (
              <form onSubmit={handleSignin} className="space-y-5">
                <EmailField email={email} setEmail={setEmail} />
                <PasswordField password={password} setPassword={setPassword} />

                {error && <ErrorBox message={error} />}

                {showSignupPrompt && (
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-700">
                    Account not found. Please sign up, verify your OTP, then sign in.
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="mt-2 block font-bold underline underline-offset-4"
                    >
                      Create account
                    </button>
                  </div>
                )}

                {notice && <NoticeBox message={notice} />}
                <SubmitButton submitting={submitting} label="Sign in" loadingLabel="Signing in..." />
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-5">
                <label className="block">
                  <FieldLabel>Name</FieldLabel>
                  <div className="relative">
                    <UserRound className={FIELD_ICON_CLS} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Shubham"
                      className={`${FIELD_CLS} pl-11`}
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <FieldLabel>Position</FieldLabel>
                  <div className="relative">
                    <BriefcaseBusiness className={FIELD_ICON_CLS} />
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Founder"
                      className={`${FIELD_CLS} pl-11`}
                      required
                    />
                  </div>
                </label>

                <EmailField email={email} setEmail={setEmail} />
                <PasswordField password={password} setPassword={setPassword} />

                {error && <ErrorBox message={error} />}
                {notice && <NoticeBox message={notice} />}
                <SubmitButton
                  submitting={submitting}
                  label="Send OTP"
                  loadingLabel="Sending OTP..."
                />
              </form>
            )}

            {mode === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <label className="block">
                  <FieldLabel>OTP</FieldLabel>
                  <div className="relative">
                    <KeyRound className={FIELD_ICON_CLS} />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className={`${FIELD_CLS} pl-11 tracking-[0.4em]`}
                      required
                    />
                  </div>
                </label>

                {error && <ErrorBox message={error} />}
                {notice && <NoticeBox message={notice} />}
                <SubmitButton
                  submitting={submitting}
                  label="Verify OTP"
                  loadingLabel="Verifying..."
                />
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="w-full text-sm font-bold text-indigo-600 hover:underline"
                >
                  Change signup details
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
      {children}
    </span>
  );
}

function EmailField({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (value: string) => void;
}) {
  return (
    <label className="block">
      <FieldLabel>Email</FieldLabel>
      <div className="relative">
        <Mail className={FIELD_ICON_CLS} />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="shubham@edfoal.com"
          className={`${FIELD_CLS} pl-11`}
          required
        />
      </div>
    </label>
  );
}

function PasswordField({
  password,
  setPassword,
}: {
  password: string;
  setPassword: (value: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const ToggleIcon = showPassword ? EyeOff : Eye;

  return (
    <label className="block">
      <FieldLabel>Password</FieldLabel>
      <div className="relative">
        <Lock className={FIELD_ICON_CLS} />
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Enter password"
          className={`${FIELD_CLS} pl-11 pr-11`}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 transition-colors hover:text-indigo-800"
        >
          <ToggleIcon className="h-4 w-4" />
        </button>
      </div>
    </label>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-600">
      {message}
    </div>
  );
}

function NoticeBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-600">
      {message}
    </div>
  );
}

function SubmitButton({
  submitting,
  label,
  loadingLabel,
}: {
  submitting: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <GlowButton
      type="submit"
      variant="primary"
      disabled={submitting}
      className="h-12 w-full"
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </GlowButton>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mesh-bg grid min-h-screen place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
