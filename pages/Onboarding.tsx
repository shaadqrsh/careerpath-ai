import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AppView, UserProfile } from '../types';
import { Button } from '../components/Button';
import { CustomSelect } from '../components/CustomSelect';
import { Loader2, LogOut, User, MapPin } from 'lucide-react';
import { FALLBACK_COUNTRIES } from '../constants';
import { upsertUserProfile, getCurrentUser } from '../services/supabaseService';

export const Onboarding: React.FC = () => {
  const { setView, setUser, logout, showToast } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

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
    let isMounted = true;
    const checkSession = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                if (isMounted) setView(AppView.AUTH);
            } else {
                if (isMounted) setIsVerifyingSession(false);
            }
        } catch (e) {
             if (isMounted) setView(AppView.AUTH);
        }
    };
    checkSession();
    return () => { isMounted = false; };
  }, [setView]);

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
            setCountries(FALLBACK_COUNTRIES);
        } finally {
            setIsLoadingCountries(false);
        }
    };
    fetchCountries();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
        const authUser = await getCurrentUser();
        
        if (!authUser) {
            showToast("Session expired. Please log in again.");
            setView(AppView.AUTH);
            return;
        }

        const finalProfile: UserProfile = {
            id: authUser.id, 
            ...formData,
            preferredWorkCountry: formData.preferredWorkCountry || formData.residenceCountry || 'USA',
        } as UserProfile;

        await upsertUserProfile(finalProfile);
        setUser(finalProfile);
        setView(AppView.DASHBOARD);
    } catch (err: any) {
        showToast(`Failed to save profile: ${err.message}.`);
    } finally {
        setSaving(false);
    }
  };

  const handleLogout = async () => {
      await logout();
      setView(AppView.AUTH);
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

  if (isVerifyingSession) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 transition-colors relative">
      
      <div className="w-full max-w-3xl">
        <div className="flex justify-end mb-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
            <button 
                onClick={handleLogout}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors font-medium"
            >
                <LogOut size={16} /> Wrong Account?
            </button>
        </div>

        <div className="mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">Tell us about yourself</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">This helps us calibrate your recommendations based on location and demographics.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-sm transition-all animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
            
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <User size={18} /> Personal Details
                </h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                            <input 
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                            <CustomSelect 
                                value={formData.gender || 'Male'}
                                onChange={(val) => handleChange('gender', val)}
                                options={['Male', 'Female', 'Non-binary']}
                            />
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
                            <CustomSelect 
                                value={formData.educationLevel || 'High School'}
                                onChange={(val) => handleChange('educationLevel', val)}
                                options={['High School', 'Undergraduate', 'Graduate', 'PhD', 'Bootcamp/Self-taught']}
                            />
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
                            placeholder="e.g. Commerce, Computer Science, Biology, General Science"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 animate-fade-in-up opacity-0 relative z-20" style={{ animationDelay: '400ms' }}>
                <h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <MapPin size={18} /> Location Details
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Residence</label>
                        <CustomSelect 
                            value={formData.residenceCountry || ''}
                            onChange={(val) => handleChange('residenceCountry', val)}
                            options={isLoadingCountries ? [{label: "Loading Countries...", value: ""}] : countries}
                            placeholder="Select Country"
                            disabled={isLoadingCountries}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Future Work Preference</label>
                        <CustomSelect 
                            value={formData.preferredWorkCountry || ''}
                            onChange={(val) => handleChange('preferredWorkCountry', val)}
                            options={[
                                ...(formData.residenceCountry ? [{label: `${formData.residenceCountry} (Current)`, value: formData.residenceCountry}] : []),
                                'USA', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Singapore', 'India', 'Undecided', 'Remote (Global)'
                            ]}
                            placeholder="Select Preference"
                        />
                    </div>
                </div>
            </div>

            <div className="animate-fade-in-up opacity-0 relative z-10" style={{ animationDelay: '500ms' }}>
                <Button type="submit" fullWidth size="lg" disabled={saving}>
                    {saving ? "Creating Profile..." : "Continue to Dashboard"}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
};