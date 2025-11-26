import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AppView, UserProfile } from '../types';
import { Button } from '../components/Button';
import { CustomSelect } from '../components/CustomSelect';
import { ArrowLeft, Loader2, User, MapPin, Settings } from 'lucide-react';
import { FALLBACK_COUNTRIES } from '../constants';
import { upsertUserProfile, getUserProfile, getCurrentUser, sendPasswordResetEmail } from '../services/supabaseService';
import { ConfirmModal } from '../components/ConfirmModal';

export const Profile: React.FC = () => {
  const { user, setView, setUser, showPasswordResetModal, setShowPasswordResetModal, showToast, theme, setTheme } = useAppStore();
  
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [initialData, setInitialData] = useState<Partial<UserProfile> | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

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
             setInitialData(profile);
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

  const hasUnsavedChanges = () => {
      if (!initialData) return false;
      return JSON.stringify(initialData) !== JSON.stringify(formData);
  };

  const handleBackNavigation = () => {
      if (hasUnsavedChanges()) {
          setShowUnsavedModal(true);
      } else {
          setView(AppView.DASHBOARD);
      }
  };

  const confirmDiscardChanges = () => {
      setShowUnsavedModal(false);
      setView(AppView.DASHBOARD);
  };

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
        setInitialData(updatedProfile);
        showToast("Profile Updated Successfully!");
    } catch (error: any) {
        console.error("Failed to update profile", error);
        showToast(`Failed to save changes: ${error.message || "Unknown error"}`);
    } finally {
        setIsSaving(false);
    }
  };

  const confirmPasswordReset = async () => {
      setShowPasswordResetModal(false);
      try {
          const authUser = await getCurrentUser();
          if (authUser && authUser.email) {
              await sendPasswordResetEmail(authUser.email);
              showToast(`Email sent successfully to ${authUser.email}`);
          } else {
              showToast("Could not determine your email address.");
          }
      } catch (e) {
          showToast("Failed to send reset email.");
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 transition-colors duration-300 relative">
      
      <div className="w-full max-w-3xl">
        <div className="mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
            <button 
                onClick={handleBackNavigation}
                disabled={isSaving} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-sm transition-all animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
             
             <div className="animate-fade-in-up opacity-0 relative z-30" style={{ animationDelay: '200ms' }}>
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
                            placeholder="e.g. Commerce, Computer Science, Biology"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 animate-fade-in-up opacity-0 relative z-20" style={{ animationDelay: '300ms' }}>
                <h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <MapPin size={18} /> Location Details
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Residence</label>
                        <CustomSelect 
                            value={formData.residenceCountry || ''}
                            onChange={(val) => handleChange('residenceCountry', val)}
                            options={isLoadingCountries ? [{label: "Loading...", value: ""}] : countries}
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

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 animate-fade-in-up opacity-0 relative z-10" style={{ animationDelay: '400ms' }}>
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Settings size={18} /> Account Details
                 </h3>
                 
                 <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">App Theme</label>
                        <CustomSelect 
                            value={theme}
                            onChange={(val) => setTheme(val)}
                            options={[
                                { label: "System Default", value: "system" },
                                { label: "Light", value: "light" },
                                { label: "Dark", value: "dark" }
                            ]}
                        />
                    </div>

                    <div>
                        <Button type="button" variant="outline" fullWidth onClick={() => setShowPasswordResetModal(true)}>
                            Send Password Reset Email
                        </Button>
                    </div>
                 </div>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 animate-fade-in-up opacity-0 relative z-0" style={{ animationDelay: '500ms' }}>
                <Button type="submit" fullWidth size="lg" disabled={isSaving}>
                    {isSaving ? "Saving Changes..." : "Save Changes"}
                </Button>
            </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        onConfirm={confirmPasswordReset}
        title="Reset Password?"
        description="This will send a secure link to your registered email address to reset your password."
        confirmText="Yes, Send Email"
        variant="info"
      />

      <ConfirmModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onConfirm={confirmDiscardChanges}
        title="Unsaved Changes"
        description="You have unsaved changes in your profile. Are you sure you want to discard them?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
      />

    </div>
  );
};