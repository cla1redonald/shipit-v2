import { supabase } from './supabase';
import type { DietaryProfile, Profile, SeverityLevel, DietType } from '../types';

// Convert DB row to app Profile type
function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    allergies: (row.allergies as string[]) || [],
    dietTypes: (row.diet_types as DietType[]) || [],
    severityLevels: (row.severity_levels as Record<string, SeverityLevel>) || {},
    customRestrictions: (row.custom_restrictions as string[]) || [],
    disclaimerAcceptedAt: row.disclaimer_accepted_at as string | null,
    onboardingCompleted: row.onboarding_completed as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function fetchProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;
  return toProfile(data);
}

export async function saveProfile(profile: DietaryProfile): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload = {
    user_id: user.id,
    allergies: profile.allergies,
    diet_types: profile.dietTypes,
    severity_levels: profile.severityLevels,
    custom_restrictions: profile.customRestrictions,
    disclaimer_accepted_at: profile.disclaimerAcceptedAt,
    onboarding_completed: profile.onboardingCompleted,
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return toProfile(data);
}

export async function deleteProfile(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}
