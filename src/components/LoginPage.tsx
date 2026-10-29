import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, LogIn } from 'lucide-react';
import loginBackground from '../../loginImage.jpeg';

interface LoginPageProps {
  errorMessage?: string;
  onLogin: (username: string, password: string) => Promise<void>;
  onSignUp: (username: string, email: string, password: string) => Promise<boolean>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ errorMessage, onLogin, onSignUp }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [email, setEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onLogin(username, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'लगइन असफल भयो। पुनः प्रयास गर्नुहोस्।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      const confirmationRequired = await onSignUp(signUpUsername, email, signUpPassword);
      if (confirmationRequired) {
        setNotice('तपाईंको इमेलमा verification link पठाइएको छ। इमेल verify गरेपछि आफ्नो इमेल र पासवर्डबाट लगइन गर्नुहोस्।');
      }
    } catch (signUpError) {
      setError(signUpError instanceof Error ? signUpError.message : 'खाता बनाउन सकिएन। पुनः प्रयास गर्नुहोस्।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setError('');
    setNotice('');
  };

  return (
    <main
      className="login-screen relative flex min-h-screen items-center bg-cover bg-center px-5 py-8 sm:px-10 lg:px-16"
      style={{ backgroundImage: `url("${loginBackground}")` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#071b37]/85 via-[#0c2b50]/65 to-[#0c2b50]/20" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px] lg:gap-16">
        <div className="hidden max-w-xl text-white lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-bold shadow-lg backdrop-blur-sm">ख</div>
            <div>
              <div className="text-xl font-bold tracking-tight">सार्वजनिक खरिद सहयोगी</div>
              <div className="mt-0.5 text-sm text-blue-100/90">खरिद प्रक्रिया गाइड</div>
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-blue-200">सजिलो · पारदर्शी · व्यवस्थित</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">सार्वजनिक खरिदका हरेक चरणमा<br />विश्वसनीय साथ।</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-blue-50/85">खरिद योजना, खरिद व्यवस्थापन, कानुनी सन्दर्भ र उपयोगी सामग्रीहरू एउटै स्थलमा।</p>
        </div>

        <section className="w-full rounded-3xl border border-white/70 bg-white/95 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-md sm:p-9">
          <div className="mb-6 flex items-center gap-3 text-slate-900 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-lg font-bold text-white">ख</div>
            <div>
              <div className="font-bold tracking-tight">सार्वजनिक खरिद सहयोगी</div>
              <div className="text-xs text-slate-500">खरिद प्रक्रिया गाइड</div>
            </div>
          </div>
          <div className="mb-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isSignUp ? 'नयाँ खाता बनाउनुहोस्' : 'लगइन गर्नुहोस्'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              {isSignUp
                ? 'इमेल verify गरेपछि आफ्नो खातामा लगइन गर्न सक्नुहुन्छ।'
                : 'आफ्नो लगइन विवरण प्रविष्ट गर्नुहोस्।'}
            </p>
          </div>

          {isSignUp ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="signup-username" className="mb-1.5 block text-sm font-medium text-slate-700">
                  प्रयोगकर्ता नाम
                </label>
                <input
                  id="signup-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  minLength={3}
                  maxLength={32}
                  pattern="[a-zA-Z0-9._-]+"
                  title="३ देखि ३२ अक्षर: अंग्रेजी अक्षर, अंक, डट, ड्यास वा अन्डरस्कोर"
                  value={signUpUsername}
                  onChange={(event) => {
                    setSignUpUsername(event.target.value);
                    setError('');
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  इमेल ठेगाना
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  पासवर्ड (कम्तीमा ८ अक्षर)
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    name="new-password"
                    type={showSignUpPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={8}
                    value={signUpPassword}
                    onChange={(event) => {
                      setSignUpPassword(event.target.value);
                      setError('');
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                    aria-label={showSignUpPassword ? 'पासवर्ड लुकाउनुहोस्' : 'पासवर्ड देखाउनुहोस्'}
                  >
                    {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? 'खाता बनाउँदैछ...' : 'खाता बनाउनुहोस्'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-username" className="mb-1.5 block text-sm font-medium text-slate-700">
                  प्रयोगकर्ता नाम वा इमेल
                </label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError('');
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  पासवर्ड
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError('');
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? 'पासवर्ड लुकाउनुहोस्' : 'पासवर्ड देखाउनुहोस्'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              {!error && errorMessage && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? 'लगइन हुँदैछ...' : 'लगइन'}
              </button>
            </form>
          )}

          {notice && (
            <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>
          )}

          <p className="mt-5 text-center text-sm text-slate-600">
            {isSignUp ? 'पहिले नै खाता छ?' : 'नयाँ user हो?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(!isSignUp)}
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              {isSignUp ? 'लगइन गर्नुहोस्' : 'खाता बनाउनुहोस्'}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
};
