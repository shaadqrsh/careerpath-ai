import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Button } from '../components/Button';
import { Mail, Lock, Sun, Moon, AlertCircle } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/supabaseService';

export const Auth: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        if (isLogin) {
            await signInWithEmail(email, password);
            // Navigation handled by App.tsx listener
        } else {
            await signUpWithEmail(email, password);
            alert("Account created! Please check your email to verify your account before logging in.");
            setIsLogin(true); // Switch to login after signup
        }
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Authentication failed");
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      try {
          await signInWithGoogle();
      } catch (err: any) {
          setError(err.message || "Google Sign-In failed");
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 transition-colors duration-300 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
        >
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-xl backdrop-blur-sm transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
              {isLogin ? "Sign in to access your career dashboard" : "Join us to find your perfect career path"}
          </p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5" />
              <input 
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800/0 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <Button type="button" variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white" onClick={handleGoogleLogin}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12.61C5,8.76 8.32,5.97 12.19,5.97C14.61,5.97 16.28,7.02 17.15,7.85L19.16,5.83C17.27,4.14 14.92,3.27 12.19,3.27C6.84,3.27 2.5,7.68 2.5,12.85C2.5,17.9 6.84,22.5 12.19,22.5C17.5,22.5 21.58,18.77 21.58,13.13C21.58,12.43 21.5,11.78 21.35,11.1Z" />
                </svg>
               Continue with Google
             </Button>
          </div>

          <div className="text-center mt-4">
             <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
             >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};