import { createClient, User, SupabaseClient } from '@supabase/supabase-js';
import { CareerRecommendation, UserProfile } from '../types';

// --- CONFIGURATION HANDLING ---

// ADD WHEN DEPLOY: In production, these should be strictly environment variables.
// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_KEY = process.env.SUPABASE_KEY;

// FOR DEVELOPMENT/PREVIEW: Check LocalStorage first, then fall back to env vars (if any)
const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('career_path_sb_url');
  const localKey = localStorage.getItem('career_path_sb_key');
  
  // ADD WHEN DEPLOY: Remove the localStorage fallback for better security in production
  return {
    url: localUrl || process.env.SUPABASE_URL || '',
    key: localKey || process.env.SUPABASE_KEY || ''
  };
};

const config = getSupabaseConfig();

export const supabase: SupabaseClient | null = (config.url && config.key) 
  ? createClient(config.url, config.key) 
  : null;

// Helper to save keys from the UI (Dev Mode only)
export const saveSupabaseConfig = (url: string, key: string) => {
    localStorage.setItem('career_path_sb_url', url);
    localStorage.setItem('career_path_sb_key', key);
    window.location.reload(); // Reload to re-initialize the client
};

export const clearSupabaseConfig = () => {
    localStorage.removeItem('career_path_sb_url');
    localStorage.removeItem('career_path_sb_key');
    window.location.reload();
};


// --- Auth Helpers ---

export const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
};

export const signInWithGoogle = async () => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
};

// --- Profile Management ---

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // PGRST116 means row not found (JSON object requested, multiple (or no) rows returned)
            // This is expected for new users.
            if (error.code !== 'PGRST116') {
                console.error("Database error fetching profile:", error);
            }
            return null;
        }

        if (!data) return null;

        // Map DB columns (snake_case) to App Type (camelCase)
        return {
            id: data.user_id,
            fullName: data.full_name,
            gender: data.gender,
            age: data.age,
            educationLevel: data.education_level,
            specialization: data.specialization,
            residenceCountry: data.residence_country,
            preferredWorkCountry: data.preferred_work_country
        };
    } catch (e) {
        console.error("Unexpected error fetching profile:", e);
        return null;
    }
};

export const upsertUserProfile = async (profile: UserProfile) => {
    if (!supabase) return;

    try {
        // Map App Type to DB columns
        const dbProfile = {
            user_id: profile.id,
            full_name: profile.fullName,
            gender: profile.gender,
            age: profile.age,
            education_level: profile.educationLevel,
            specialization: profile.specialization,
            residence_country: profile.residenceCountry,
            preferred_work_country: profile.preferredWorkCountry,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(dbProfile, { onConflict: 'user_id' });
            
        if (error) throw error;
    } catch (e) {
        console.error("Error saving profile:", e);
        throw e;
    }
};

// --- Storage & DB Logic (Existing) ---

// Convert Base64 string to Blob for upload
const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
  // Strip data URI prefix if present
  const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

export const uploadCareerImages = async (
  userId: string, 
  careerId: string, 
  images: string[]
): Promise<string[]> => {
  if (!supabase) {
    console.warn("Supabase not configured. Skipping upload.");
    return images.map(img => img.startsWith('http') ? img : (img.startsWith('data:') ? img : `data:image/png;base64,${img}`));
  }

  const uploadedUrls: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const imageStr = images[i];

    // Check if it's already a hosted URL (from previous save or fallback)
    if (imageStr.startsWith('http')) {
        uploadedUrls.push(imageStr);
        continue;
    }

    // It is a base64 or data URI, needs upload
    const blob = base64ToBlob(imageStr);
    const fileName = `${userId}/${careerId}/slide_${i}_${Date.now()}.png`;

    try {
      const { data, error } = await supabase.storage
        .from('career_slideshows')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('career_slideshows')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    } catch (err) {
      console.error(`Failed to upload image ${i}`, err);
      // Fallback: Use Data URI if upload fails so user still sees it
      uploadedUrls.push(imageStr.startsWith('data:') ? imageStr : `data:image/png;base64,${imageStr}`);
    }
  }

  return uploadedUrls;
};

// Deletes all images in the career specific folder
export const deleteCareerImages = async (userId: string, careerId: string) => {
    if (!supabase) return;
    
    const folderPath = `${userId}/${careerId}`;
    try {
        // List all files in the folder
        const { data: listData, error: listError } = await supabase.storage
            .from('career_slideshows')
            .list(folderPath);

        if (listError) throw listError;

        if (listData && listData.length > 0) {
            const filesToRemove = listData.map(x => `${folderPath}/${x.name}`);
            
            const { error: removeError } = await supabase.storage
                .from('career_slideshows')
                .remove(filesToRemove);
            
            if (removeError) throw removeError;
        }
    } catch (err) {
        console.error("Failed to delete images from storage", err);
    }
};

export const saveCareerToDb = async (userId: string, career: CareerRecommendation) => {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('saved_careers')
      .upsert({
        user_id: userId,
        career_id: career.id,
        title: career.title,
        data: career, // Storing full JSON for simplicity in this demo
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id, career_id' });

    if (error) throw error;
  } catch (err) {
    console.error("Failed to save career to DB", err);
  }
};

export const deleteCareerFromDb = async (userId: string, careerId: string) => {
  if (!supabase) return;
  
  try {
    // Delete associated images first to ensure no orphans
    await deleteCareerImages(userId, careerId);

    // Delete database record
    await supabase
      .from('saved_careers')
      .delete()
      .match({ user_id: userId, career_id: careerId });
  } catch (err) {
    console.error("Failed to delete career from DB", err);
  }
};