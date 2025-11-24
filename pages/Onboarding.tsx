
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AppView, UserProfile } from '../types';
import { Button } from '../components/Button';
import { Loader2 } from 'lucide-react';
import { FALLBACK_COUNTRIES } from '../constants';
import { upsertUserProfile, getCurrentUser } from '../services/supabaseService';

export const Onboarding: React.FC = () => {
  const { setView, setUser, user } = useAppStore();
  const [saving, setSaving] = useState(false);
  
  // API Data State
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: '',
    gender: 'Male', // Default to a specific gender for image gen
    age: 18,
    educationLevel: 'High School',
    specialization: '',
    residenceCountry: '',
    preferredWorkCountry: '' // Will default to residence country
  });

  // Fetch Countries from Public API
  useEffect(() => {
    const fetchCountries = async () => {
        try {
            // Using restcountries.com which is CORS-friendly
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
        // Fetch the REAL authenticated user ID directly from Backend Service
        const authUser = await getCurrentUser();
        
        if (!authUser) {
            throw new Error("No authenticated session found. Please log in again.");
        }

        const finalProfile: UserProfile = {
            id: authUser.id, 
            ...formData,
            preferredWorkCountry: formData.preferredWorkCountry || formData.residenceCountry || 'USA',
        } as UserProfile;

        // Save to Supabase (Via Backend)
        await upsertUserProfile(finalProfile);
        
        // Update Store
        setUser(finalProfile);
        setView(AppView.DASHBOARD);
    } catch (err: any) {
        console.error("Profile Save Error:", err);
        alert(`Failed to save profile: ${err.message || "Unknown error"}. Please check your connection.`);
    } finally {
        setSaving(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    // If changing residence country, update preferred country if it wasn't manually changed
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 transition-colors">
      <div className="w-full max-w-lg">
        <div className="mb-8">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/2"></div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-6">Tell us about yourself</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">This helps our AI calibrate your recommendations based on location and demographics.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <input 
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                    <select 
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
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
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Level</label>
                    <select 
                        value={formData.educationLevel}
                        onChange={(e) => handleChange('educationLevel', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
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
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    placeholder="e.g. Commerce, Computer Science, Biology, General Science"
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
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors disabled:opacity-50"
                    >
                        <option value="">{isLoadingCountries ? "Loading Countries..." : "Select Country"}</option>
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
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
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

            <Button type="submit" fullWidth size="lg" disabled={saving}>
                {saving ? "Creating Profile..." : "Continue to Dashboard"}
            </Button>
        </form>
      </div>
    </div>
  );
};
