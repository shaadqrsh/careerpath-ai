import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AppView, UserProfile } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, Loader2, Shield, CheckCircle } from 'lucide-react';
import { FALLBACK_COUNTRIES } from '../constants';
import { upsertUserProfile, getUserProfile, getCurrentUser, sendPasswordResetEmail } from '../services/supabaseService';

export const Profile: React.FC = () => {
  const { user, setView, setUser } = useAppStore();
  
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: '',
    gender: 'Male',
    age: 18,
    educationLevel: 'High School',
    specialization: '',
    residenceCountry: '',
    preferredWorkCountry: ''
  });

  useEffect(() => {
    const fetchCountries = async () => {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
            if (!response.ok) throw new Error("Failed to fetch countries");
            
            const data = await response.json();
            const countryNames = data
                .map((c: any) => c.name.common)
                .sort((a: string, b: string) => a.localeCompare(b));
            
            setCountries(countryNames);
        } catch (error) {
            console.warn("Country API failed, using fallback list:", error);
            setCountries(FALLBACK_COUNTRIES);
        } finally {
            setIsLoadingCountries(false);
        }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        const authUser = await getCurrentUser();
        if (authUser) {
           const profile = await getUserProfile(authUser.id);
           if (profile && isMounted) {
             setFormData(profile);
             setUser(profile);
           }
        }
      } catch (err) {
        console.error("Error loading profile data", err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };
    initData();
    return () => { isMounted = false; };
  }, [setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
        const authUser = await getCurrentUser();
        if (!authUser) throw new Error("No active session");

        const updatedProfile = { 
            id: authUser.id, 
            ...formData,
            preferredWorkCountry: formData.preferredWorkCountry || formData.residenceCountry || 'USA',
        } as UserProfile;

        await upsertUserProfile(updatedProfile);
        setUser(updatedProfile);
        
        // Show Success Toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    } catch (error: any) {
        console.error("Failed to update profile", error);
        alert(`Failed to save changes: ${error.message || "Unknown error"}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
      if (!window.confirm("Send a password reset link to your email?")) return;
      try {
          const authUser = await getCurrentUser();
          if (authUser && authUser.email) {
              await sendPasswordResetEmail(authUser.email);
              alert(`Password reset link sent to ${authUser.email}`);
          } else {
              alert("Could not determine your email address.");
          }
      } catch (e) {
          alert("Failed to send reset email.");
      }
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    if (field === 'residenceCountry') {
      const isPreferredSameAsOldResidence = formData.preferredWorkCountry === formData.residenceCountry || formData.preferredWorkCountry === '';
      setFormData(prev => ({ 
          ...prev, 
          [field]: value, 
          preferredWorkCountry: isPreferredSameAsOldResidence ? value : prev.preferredWorkCountry
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (isLoadingData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 transition-colors duration-300">
      {/* Widened Layout: max-w-4xl */}
      <div className="w-full max-w-4xl">
        <div className="mb-6">
            <button 
                onClick={() => setView(AppView.DASHBOARD)}
                disabled={isSaving} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl transition-all">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <input 
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                    <select 
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Age</label>
                    <input 
                        type="number"
                        required
                        min={14}
                        max={80}
                        value={formData.age}
                        onChange={(e) => handleChange('age', parseInt(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Level</label>
                    <select 
                        value={formData.educationLevel}
                        onChange={(e) => handleChange('educationLevel', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    >
                        <option>High School</option>
                        <option>Undergraduate</option>
                        <option>Graduate</option>
                        <option>PhD</option>
                        <option>Bootcamp/Self-taught</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Major / Specialization</label>
                <input 
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    placeholder="e.g. Commerce, Computer Science, Biology"
                />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Current Residence</h3>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                        Country
                        {isLoadingCountries && <Loader2 size={14} className="animate-spin text-blue-500" />}
                    </label>
                    <select 
                            required
                            value={formData.residenceCountry}
                            onChange={(e) => handleChange('residenceCountry', e.target.value)}
                            disabled={isLoadingCountries}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors disabled:opacity-50"
                    >
                        <option value="">{isLoadingCountries ? "Loading..." : "Select Country"}</option>
                        {countries.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-4">Future Work Preference</h3>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Country</label>
                    <select 
                        value={formData.preferredWorkCountry}
                        onChange={(e) => handleChange('preferredWorkCountry', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    >
                         {formData.residenceCountry && <option value={formData.residenceCountry}>{formData.residenceCountry} (Current)</option>}
                        <option value="USA">USA</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="Australia">Australia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="India">India</option>
                        <option value="Undecided">Undecided</option>
                        <option value="Remote (Global)">Remote (Global)</option>
                    </select>
                </div>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Shield size={16} /> Security
                 </h3>
                 <Button type="button" variant="outline" fullWidth onClick={handlePasswordReset}>
                    Send Password Reset Email
                 </Button>
            </div>

            <Button type="submit" fullWidth size="lg" disabled={isSaving}>
                {isSaving ? "Saving Changes..." : "Save Changes"}
            </Button>
        </form>
      </div>

      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-[fadeIn_0.3s_ease-out] z-50">
            <CheckCircle className="text-green-400 shrink-0" />
            <div>
                <p className="font-bold">Profile Updated Successfully!</p>
            </div>
        </div>
      )}
    </div>
  );
};