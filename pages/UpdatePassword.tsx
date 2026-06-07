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
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-[#14130f] px-4 py-12 transition-colors duration-300 relative tex-grid">
      <div className="w-full max-w-md bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper shadow-stamp-lg dark:shadow-stamp-light animate-fade-in-up">
        <div className="flex items-center justify-between border-b-2 border-ink dark:border-paper px-7 py-3 bg-ink dark:bg-paper text-paper dark:text-ink">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Member card</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">New key</span>
        </div>

        <div className="p-7 md:p-8">
          <h2 className="font-display text-3xl text-ink dark:text-paper leading-tight">Set a new password</h2>
          <p className="mt-2 font-serif text-lg text-ink/70 dark:text-paper/70">Choose something you will remember.</p>

          {success && (
            <div className="mt-6 p-4 border-2 border-pine bg-pine/10 text-pine text-sm flex items-start gap-3 animate-fade-in">
              <CheckCircle size={18} className="mt-0.5 shrink-0" />
              <span className="font-medium">Password updated. Redirecting...</span>
            </div>
          )}

          {error && (
            <div className="mt-6 p-3 border-2 border-vermillion bg-vermillion/10 text-vermillion-600 dark:text-vermillion text-sm text-center font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 mt-7">
            <Input
              label="New Password"
              icon={<Lock />}
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
            />

            <Input
              label="Confirm Password"
              icon={<Lock />}
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
            />

            <Button type="submit" fullWidth disabled={loading || success}>
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};