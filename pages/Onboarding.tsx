import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AppView, UserProfile } from '../types';
import { Button } from '../components/Button';
import { CustomSelect } from '../components/CustomSelect';
import { Input } from '../components/Input';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { LogOut, User, MapPin } from 'lucide-react';
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
      return <FullScreenLoader />;
  }

  const labelCls = "block text-[11px] font-bold uppercase tracking-[0.18em] text-ink/60 dark:text-paper/60 mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-[#14130f] px-4 py-12 transition-colors relative tex-grid">

      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-5 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/55 dark:text-paper/55">
            Survey · Form A · Particulars
          </span>
          <button
            onClick={handleLogout}
            className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60 dark:text-paper/60 hover:text-vermillion underline decoration-2 decoration-transparent hover:decoration-vermillion underline-offset-4 flex items-center gap-2 transition-all"
          >
            <LogOut size={14} /> Wrong account
          </button>
        </div>

        <div className="mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
          <h2 className="font-display text-4xl md:text-5xl text-ink dark:text-paper leading-[0.95]">Tell us where you stand.</h2>
          <p className="mt-3 font-serif text-lg text-ink/70 dark:text-paper/70 max-w-xl">We calibrate every recommendation against your background, demographics, and location.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper shadow-stamp-lg dark:shadow-stamp-light animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>

          <div className="p-8 animate-fade-in-up opacity-0 relative z-30" style={{ animationDelay: '300ms' }}>
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
                  placeholder="Your name"
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
                placeholder="e.g. Commerce, Computer Science, Biology, General Science"
              />
            </div>
          </div>

          <div className="border-t-2 border-dashed border-ink/40 dark:border-paper/40 p-8 animate-fade-in-up opacity-0 relative z-20" style={{ animationDelay: '400ms' }}>
            <h3 className="font-display text-xl text-pine dark:text-pine mb-6 flex items-center gap-2">
              <MapPin size={20} strokeWidth={2.25} /> Location details
            </h3>

            <div className="space-y-6">
              <div>
                <label className={labelCls}>Current Residence</label>
                <CustomSelect
                  value={formData.residenceCountry || ''}
                  onChange={(val) => handleChange('residenceCountry', val)}
                  options={isLoadingCountries ? [{ label: "Loading countries...", value: "" }] : countries}
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

          <div className="border-t-2 border-ink dark:border-paper p-8 animate-fade-in-up opacity-0 relative z-10" style={{ animationDelay: '500ms' }}>
            <Button type="submit" fullWidth size="lg" disabled={saving}>
              {saving ? "Filing your card..." : "Continue to dashboard"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};