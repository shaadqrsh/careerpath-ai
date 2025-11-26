import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Lock, CheckCircle } from 'lucide-react';
import { updateUserPassword, getCurrentUser, getUserProfile, getSavedCareers } from '../services/supabaseService';

export const UpdatePassword: React.FC = () => {
  const { setView, setUser, setSavedCareers } = useAppStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await updateUserPassword(password);
      
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
                      console.warn("Failed to load saved careers after reset", e);
                  }
              }
          }
      } catch (hydrationError) {
          console.warn("State hydration failed after password reset", hydrationError);
      }

      setSuccess(true);
      setTimeout(() => {
        setView(AppView.DASHBOARD);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 transition-colors duration-300 relative">
      <div className="w-full max-w-md bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-xl backdrop-blur-sm transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Enter your new password below.</p>
        </div>

        {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-xl text-sm flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                <CheckCircle size={18} className="mt-0.5 shrink-0" />
                <span>Password updated! Redirecting...</span>
            </div>
        )}

        {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="New Password"
            icon={<Lock />}
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Input 
            label="Confirm Password"
            icon={<Lock />}
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" fullWidth disabled={loading || success}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};