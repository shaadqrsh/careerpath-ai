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
        } else if (msg.includes("Invalid login credentials")) {
            msg = "Incorrect email or password.";
        } else if (msg.includes("User already registered") || msg.includes("already exists")) {
            msg = "Account already exists. Please log in.";
        } else if (msg.includes("password should be at least")) {
            msg = "Password must be at least 6 characters.";
        }
        
        setError(msg);
        setLoading(false);
    }
  };

  const heading = isForgotPassword ? "Reset access" : (isLogin ? "Welcome back" : "New membership");
  const subhead = isForgotPassword
    ? "Enter your email and we will post a reset link."
    : (isLogin ? "Sign in to return to your almanac." : "Open an account and start your survey.");
  const stub = isForgotPassword ? "Recovery" : (isLogin ? "Returning" : "Enrolling");

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-[#14130f] px-4 py-12 transition-colors duration-300 relative tex-grid">
      <div className="w-full max-w-md animate-fade-in-up">
        <button
          onClick={() => setView(AppView.LANDING)}
          className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink/55 dark:text-paper/55 hover:text-vermillion transition-colors"
        >
          <ArrowLeft size={14} /> The Career Almanac
        </button>

        <div className="bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper shadow-stamp-lg dark:shadow-stamp-light">
          {/* Card header band */}
          <div className="flex items-center justify-between border-b-2 border-ink dark:border-paper px-7 py-3 bg-ink dark:bg-paper text-paper dark:text-ink">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Member card</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">{stub}</span>
          </div>

          <div className="p-7 md:p-8">
            <h2 className="font-display text-3xl text-ink dark:text-paper leading-tight">{heading}</h2>
            <p className="mt-2 font-serif text-lg text-ink/70 dark:text-paper/70">{subhead}</p>

            {successMessage && (
              <div className="mt-6 p-4 border-2 border-pine bg-pine/10 text-pine dark:text-pine text-sm flex items-start gap-3 animate-fade-in">
                <CheckCircle size={18} className="mt-0.5 shrink-0" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="mt-6 p-3 border-2 border-vermillion bg-vermillion/10 text-vermillion-600 dark:text-vermillion text-sm flex items-center gap-2 animate-fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-6 mt-7">
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
                  {loading ? 'Posting link...' : 'Send reset link'}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(false); setError(null); setSuccessMessage(null); }}
                    className="font-mono text-[11px] uppercase tracking-widest text-ink/55 dark:text-paper/55 hover:text-vermillion flex items-center justify-center gap-2 mx-auto transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to sign in
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 mt-7">
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
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-ink/60 dark:text-paper/60">Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="font-mono text-[10px] uppercase tracking-widest text-vermillion hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <Input
                    icon={<Lock />}
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? "Your password" : "Create a password"}
                  />
                </div>

                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? (isLogin ? 'Signing in...' : 'Enrolling...') : (isLogin ? 'Sign in' : 'Create account')}
                </Button>
              </form>
            )}
          </div>

          {!isForgotPassword && (
            <div className="border-t-2 border-dashed border-ink/40 dark:border-paper/40 px-7 py-4 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="font-mono text-[11px] uppercase tracking-widest text-ink/65 dark:text-paper/65 hover:text-vermillion transition-colors"
              >
                {isLogin ? "No account? Enroll now" : "Already a member? Sign in"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};