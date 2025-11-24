
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { Button } from '../components/Button';
import { Mail, Lock, Sun, Moon, AlertCircle, CheckCircle } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, getCurrentUser, getUserProfile } from '../services/supabaseService';

export const Auth: React.FC = () => {
  const { theme, toggleTheme, setView, setUser } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePostLogin = async () => {
    try {
        // Fetch current user details from backend
        const authUser = await getCurrentUser();
        if (authUser) {
            const profile = await getUserProfile(authUser.id);
            if (profile) {
                setUser(profile);
                setView(AppView.DASHBOARD);
            } else {
                setUser({ id: authUser.id } as any);
                setView(AppView.ONBOARDING);
            }
        }
    } catch (e) {
        console.error("Post login check failed", e);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
        if (isLogin) {
            await signInWithEmail(email, password);
            await handlePostLogin();
        } else {
            await signUpWithEmail(email, password);
            setSuccessMessage("Account created! Please check your email to verify your account before logging in.");
            setIsLogin(true); // Switch to login after signup
            setLoading(false); 
        }
    } catch (err: any) {
        console.error(err);
        let msg = err.message || "Authentication failed";
        if (msg.includes("Email not confirmed")) {
            msg = "Please verify your email address to log in.";
        } else if (msg.includes("User already registered") || msg.includes("already exists")) {
            msg = "Account already exists. Please log in.";
        }
        setError(msg);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 transition-colors duration-300 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
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

        {/* Success Toast for Signup */}
        {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-xl text-sm flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                <CheckCircle size={18} className="mt-0.5 shrink-0" />
                <span>{successMessage}</span>
            </div>
        )}

        {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
                <AlertCircle size={16} className="shrink-0" />
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

          <div className="text-center mt-4">
             <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMessage(null); }}
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
