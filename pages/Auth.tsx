import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, getCurrentUser, getUserProfile, sendPasswordResetEmail, getSavedCareers } from '../services/supabaseService';

export const Auth: React.FC = () => {
  const { setView, setUser, setSavedCareers } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleMode = () => {
      setIsLogin(!isLogin);
      setIsForgotPassword(false);
      setError(null);
      setSuccessMessage(null);
      setPassword(''); 
  };

  const handlePostLogin = async () => {
    try {
        const authUser = await getCurrentUser();
        if (authUser) {
            const profile = await getUserProfile(authUser.id);
            if (profile) {
                setUser(profile);
                try {
                  const saved = await getSavedCareers(authUser.id);
                  setSavedCareers(saved);
                } catch (e) {
                  console.warn("Failed to fetch saved careers on login", e);
                }
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
        await sendPasswordResetEmail(email);
        setSuccessMessage("Password reset link sent! Please check your inbox.");
        setLoading(false);
    } catch (err: any) {
        setError("Failed to send reset link. Please verify your email.");
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
            setIsLogin(true); 
            setPassword('');
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
      <div className="w-full max-w-md bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-xl backdrop-blur-sm transition-all animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {isForgotPassword ? "Reset Password" : (isLogin ? "Welcome Back" : "Create Account")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
              {isForgotPassword 
                ? "Enter your email to receive a reset link" 
                : (isLogin ? "Sign in to access your career dashboard" : "Join us to find your perfect career path")
              }
          </p>
        </div>

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

        {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
                <Input
                    label="Email"
                    icon={<Mail />}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                />
                <Button type="submit" fullWidth disabled={loading}>
                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                </Button>
                <div className="text-center mt-4">
                    <button 
                        type="button"
                        onClick={() => { setIsForgotPassword(false); setError(null); setSuccessMessage(null); }}
                        className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft size={14} /> Back to Login
                    </button>
                </div>
            </form>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Email"
                icon={<Mail />}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isLogin ? "you@example.com" : "Enter new email"}
            />
            <div>
                <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    {isLogin && (
                        <button 
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    )}
                </div>
                <div className="relative">
                    <Input
                        icon={<Lock />}
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isLogin ? "••••••••" : "Create new password"}
                    />
                </div>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
                {loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>

            <div className="text-center mt-4">
                <button 
                    type="button"
                    onClick={toggleMode}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};