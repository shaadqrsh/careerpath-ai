
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AppView, UserProfile } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FALLBACK_COUNTRIES } from '../constants';
import { upsertUserProfile, getUserProfile, getCurrentUser } from '../services/supabaseService';

export const Profile: React.FC = () => {
  const { user, setView, setUser } = useAppStore();
  
  // API Data State
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: '',
    gender: 'Male',
    age: 18,
    educationLevel: 'High School',
    specialization: '',
    residenceCountry: '',
    preferredWorkCountry: ''
  });

  // Fetch Countries
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

  // Fetch Latest User Profile on Mount with Timeout Safety
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      // Timeout Promise
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Profile load timeout")), 5000)
      );

      const fetchProfile = async () => {
          const authUser = await getCurrentUser();
          if (authUser) {
              const profile = await getUserProfile(authUser.id);
              return profile;
          }
          return null;
      };

      try {
        // Race the fetch against the 5s timeout
        const profile = await Promise.race([fetchProfile(), timeout]) as UserProfile | null;

        if (profile && isMounted) {
            setFormData(profile);
            // Also sync store just in case
            setUser(profile);
        }
      } catch (err) {
        console.error("Error loading profile data (or timeout):", err);
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
        // Fetch the REAL authenticated user ID directly from Backend
        const authUser = await getCurrentUser();
        
        if (!authUser) {
             throw new Error("No active session. Please log in again.");
        }

        const updatedProfile = { 
            id: authUser.id, 
            ...formData,
            preferredWorkCountry: formData.preferredWorkCountry || formData.residenceCountry || 'USA',
        } as UserProfile;

        // 1. Save to Supabase (Via Backend)
        await upsertUserProfile(updatedProfile);

        // 2. Update Local State
        setUser(updatedProfile);
        
        // 3. Navigate
        alert("Profile updated successfully!");
        setView(AppView.DASHBOARD);
    } catch (error: any) {
        console.error("Failed to update profile", error);
        alert(`Failed to save changes: ${error.message || "Unknown error"}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    // If changing country, update target if it matched previous residence
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
      <div className="w-full max-w-lg">
        <div className="mb-6">
            <button 
                onClick={() => setView(AppView.DASHBOARD)} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors mb-6"
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Update your demographics and location preferences.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl transition-all">
             {/* Personal Info */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            {/* Specialization */}
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

            {/* Current Residence */}
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

            {/* Preferences */}
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

            <Button type="submit" fullWidth size="lg" disabled={isSaving}>
                {isSaving ? "Saving Changes..." : "Save Changes"}
            </Button>
        </form>
      </div>
    </div>
  );
};
