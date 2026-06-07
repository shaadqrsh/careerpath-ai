import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AppView, UserProfile } from '../types';
import { Button } from '../components/Button';
import { CustomSelect } from '../components/CustomSelect';
import { Input } from '../components/Input';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { ArrowLeft, User, MapPin, Settings, Mail } from 'lucide-react';
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
  const [userEmail, setUserEmail] = useState('');

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
           if (isMounted) setUserEmail(authUser.email || '');
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
      return <FullScreenLoader />;
  }

  const labelCls = "block text-[11px] font-bold uppercase tracking-[0.18em] text-ink/60 dark:text-paper/60 mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-[#14130f] px-4 py-12 transition-colors duration-300 relative tex-grid">

      <div className="w-full max-w-3xl">
        <div className="mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
          <button
            onClick={handleBackNavigation}
            disabled={isSaving}
            className="font-mono text-[11px] uppercase tracking-widest text-ink/55 dark:text-paper/55 hover:text-vermillion flex items-center gap-2 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </button>
          <h2 className="font-display text-4xl md:text-5xl text-ink dark:text-paper leading-[0.95]">Your record.</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper shadow-stamp-lg dark:shadow-stamp-light animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>

          <div className="p-8 animate-fade-in-up opacity-0 relative z-30" style={{ animationDelay: '200ms' }}>
            <h3 className="font-display text-xl text-cobalt mb-6 flex items-center gap-2">
              <User size={20} strokeWidth={2.25} /> Personal details
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                />
                <div>
                  <label className={labelCls}>Gender</label>
                  <CustomSelect
                    value={formData.gender || 'Male'}
                    onChange={(val) => handleChange('gender', val)}
                    options={['Male', 'Female', 'Non-binary']}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Age"
                  type="number"
                  required
                  min={14}
                  max={80}
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                />
                <div>
                  <label className={labelCls}>Level</label>
                  <CustomSelect
                    value={formData.educationLevel || 'High School'}
                    onChange={(val) => handleChange('educationLevel', val)}
                    options={['High School', 'Undergraduate', 'Graduate', 'PhD', 'Bootcamp/Self-taught']}
                  />
                </div>
              </div>

              <Input
                label="Major / Specialization"
                required
                value={formData.specialization}
                onChange={(e) => handleChange('specialization', e.target.value)}
                placeholder="e.g. Commerce, Computer Science, Biology"
              />
            </div>
          </div>

          <div className="border-t-2 border-dashed border-ink/40 dark:border-paper/40 p-8 animate-fade-in-up opacity-0 relative z-20" style={{ animationDelay: '300ms' }}>
            <h3 className="font-display text-xl text-pine dark:text-pine mb-6 flex items-center gap-2">
              <MapPin size={20} strokeWidth={2.25} /> Location details
            </h3>

            <div className="space-y-6">
              <div>
                <label className={labelCls}>Current Residence</label>
                <CustomSelect
                  value={formData.residenceCountry || ''}
                  onChange={(val) => handleChange('residenceCountry', val)}
                  options={isLoadingCountries ? [{ label: "Loading...", value: "" }] : countries}
                  placeholder="Select country"
                  disabled={isLoadingCountries}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Future Work Preference</label>
                <CustomSelect
                  value={formData.preferredWorkCountry || ''}
                  onChange={(val) => handleChange('preferredWorkCountry', val)}
                  options={[
                    ...(formData.residenceCountry ? [{ label: `${formData.residenceCountry} (Current)`, value: formData.residenceCountry }] : []),
                    'USA', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Singapore', 'India', 'Undecided', 'Remote (Global)'
                  ]}
                  placeholder="Select preference"
                />
              </div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-ink/40 dark:border-paper/40 p-8 animate-fade-in-up opacity-0 relative z-10" style={{ animationDelay: '400ms' }}>
            <h3 className="font-display text-xl text-ink/60 dark:text-paper/60 mb-6 flex items-center gap-2">
              <Settings size={20} strokeWidth={2.25} /> Account details
            </h3>

            <div className="space-y-6">
              <Input
                label="Email Address"
                icon={<Mail />}
                type="email"
                value={userEmail}
                disabled
                className="cursor-not-allowed"
              />

              <div>
                <label className={labelCls}>App Theme</label>
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
                  Send password reset email
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-ink dark:border-paper p-8 animate-fade-in-up opacity-0 relative z-0" style={{ animationDelay: '500ms' }}>
            <Button type="submit" fullWidth size="lg" disabled={isSaving}>
              {isSaving ? "Saving changes..." : "Save changes"}
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