"use client"

import { } from 'react';
import { useUserProfile } from '@/app/context/UserProfileContext';

// Lightweight hook specifically for navbar profile data
export function useNavbarProfile() {
  const { userProfile, authData, isLoading } = useUserProfile();

  return {
    profile: userProfile,
    auth: authData,
    isLoading,
    hasData: Boolean(userProfile || authData),
  };
}