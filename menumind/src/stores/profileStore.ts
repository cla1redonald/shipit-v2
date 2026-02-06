import { create } from 'zustand';
import { fetchProfile, saveProfile as saveProfileService } from '../services/profile';
import type { DietaryProfile, Profile, DietType, SeverityLevel } from '../types';

interface ProfileStore {
  profile: Profile | null;
  isLoading: boolean;
  onboardingCompleted: boolean;
  draftProfile: DietaryProfile;

  fetchProfile: () => Promise<void>;
  saveProfile: () => Promise<void>;
  setDraftAllergies: (allergies: string[]) => void;
  setDraftDietTypes: (dietTypes: DietType[]) => void;
  setDraftSeverity: (allergen: string, severity: SeverityLevel) => void;
  setDraftCustomRestrictions: (restrictions: string[]) => void;
  acceptDisclaimer: () => void;
  clearProfile: () => void;
}

const defaultDraft: DietaryProfile = {
  allergies: [],
  dietTypes: [],
  severityLevels: {},
  customRestrictions: [],
  disclaimerAcceptedAt: null,
  onboardingCompleted: false,
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: false,
  onboardingCompleted: false,
  draftProfile: { ...defaultDraft },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await fetchProfile();
      if (profile) {
        set({
          profile,
          onboardingCompleted: profile.onboardingCompleted,
          draftProfile: {
            allergies: profile.allergies,
            dietTypes: profile.dietTypes,
            severityLevels: profile.severityLevels,
            customRestrictions: profile.customRestrictions,
            disclaimerAcceptedAt: profile.disclaimerAcceptedAt,
            onboardingCompleted: profile.onboardingCompleted,
          },
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  saveProfile: async () => {
    const { draftProfile } = get();
    const saved = await saveProfileService({
      ...draftProfile,
      onboardingCompleted: true,
    });
    set({
      profile: saved,
      onboardingCompleted: true,
      draftProfile: { ...draftProfile, onboardingCompleted: true },
    });
  },

  setDraftAllergies: (allergies) =>
    set((state) => ({
      draftProfile: { ...state.draftProfile, allergies },
    })),

  setDraftDietTypes: (dietTypes) =>
    set((state) => ({
      draftProfile: { ...state.draftProfile, dietTypes },
    })),

  setDraftSeverity: (allergen, severity) =>
    set((state) => ({
      draftProfile: {
        ...state.draftProfile,
        severityLevels: { ...state.draftProfile.severityLevels, [allergen]: severity },
      },
    })),

  setDraftCustomRestrictions: (restrictions) =>
    set((state) => ({
      draftProfile: { ...state.draftProfile, customRestrictions: restrictions },
    })),

  acceptDisclaimer: () =>
    set((state) => ({
      draftProfile: {
        ...state.draftProfile,
        disclaimerAcceptedAt: new Date().toISOString(),
      },
    })),

  clearProfile: () =>
    set({ profile: null, onboardingCompleted: false, draftProfile: { ...defaultDraft } }),
}));
