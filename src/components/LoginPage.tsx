import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, LogIn } from 'lucide-react';
import loginBackground from '../../loginImage.jpeg';
import { AppUser } from '../types/auth';

interface LoginPageProps {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = users.find(
      (account) => account.username.toLocaleLowerCase() === username.trim().toLocaleLowerCase()
        && account.password === password,
    );

    if (!user) {
      setError('प्रयोगकर्ता नाम वा पासवर्ड मिलेन।');
      return;
    }

    setError('');
    onLogin(user);
  };

  return (
    <main
      className="relative flex min-h-screen items-start bg-cover bg-center px-5 py-8 sm:px-10 sm:py-10 lg:px-16"
      style={{ backgroundImage: `url("${loginBackground}")` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#071b37]/50 via-[#0c2b50]/25 to-transparent" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xl font-bold shadow-lg backdrop-blur-sm">
            ख
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight sm:text-2xl">सार्वजनिक खरिद सहयोगी</div>
            <div className="mt-0.5 text-xs text-blue-100/90 sm:text-sm">
              खरिद प्रक्रिया तथा अनुपालन प्रणाली
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="mb-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">लगइन गर्नुहोस्</h1>
            <p className="mt-1.5 text-sm text-slate-600">
              प्रणाली प्रयोग गर्न आफ्नो लगइन विवरण प्रविष्ट गर्नुहोस्।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-username" className="mb-1.5 block text-sm font-medium text-slate-700">
                प्रयोगकर्ता नाम
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

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <LogIn className="h-4 w-4" />
              लगइन
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            पूर्वनिर्धारित admin लगइन: <span className="font-semibold text-slate-700">admin / admin123</span>
          </p>
        </section>
      </div>
    </main>
  );
};
