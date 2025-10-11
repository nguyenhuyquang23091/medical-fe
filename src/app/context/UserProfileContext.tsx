"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { profileClient } from '@/services/client/profileClient';
import { ERROR_MESSAGES } from '@/lib/errors/errorCode';
import { ProfileResponse, IdentityResponse, ProfileUpdateRequest, AuthDataUpdateRequest } from '@/types';
import { useSession } from 'next-auth/react';
import {
  updateProfileAction,
  updateAuthAction,
  updateAvatarAction,
  deleteAvatarAction
} from '@/actions/profile/profileActions';

type UserProfileContextType = {
  // Profile data
  userProfile: ProfileResponse | null;
  authData: IdentityResponse | null;

  // Loading states
  isLoading: boolean;

  // Error states
  userProfileError: string | null;

  // Methods
  fetchUserProfile: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserProfile: (updateRequest: ProfileUpdateRequest) => Promise<void>;
  updateAuthCredential: (authUpdateRequest: AuthDataUpdateRequest) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
}

// Create Context
const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

type UserProfileProviderProps = { 
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const [userProfile, setUserProfile] = useState<ProfileResponse | null>(null);
  const [authData, setAuthData] = useState<IdentityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfileError, setUserProfileError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { status } = useSession();

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setUserProfileError(null);

      console.log('🔄 Making API call');

      const [profileResult, authResult] = await Promise.all([
        profileClient.getProfile(),
        profileClient.getAuthInfo()
      ]);

      console.log('Fetched Profile from API:', profileResult);
      console.log('Fetched Auth Data from API:', authResult);

      setUserProfile(profileResult);
      setAuthData(authResult);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = Number(error.code) || 9999;
        setUserProfileError(ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[9999]);
      } else {
        setUserProfileError(ERROR_MESSAGES[9999]);
      }
      // Error is logged, UI layer should handle user feedback
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    await fetchUserProfile();
  };
  const updateUserProfile = async  (updateRequest : ProfileUpdateRequest) => {
    try {
        setIsLoading(true);
        setUserProfileError(null);

        // Use server action to update
        await updateProfileAction(updateRequest);

        // Fetch fresh data
        await fetchUserProfile();

    } catch (error) {
        console.error('Error updating user profile:', error);
        if (error && typeof error === 'object' && 'code' in error) {
            const errorCode = Number(error.code) || 9999;
            setUserProfileError(ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[9999]);
        } else {
            setUserProfileError(ERROR_MESSAGES[9999]);
        }
    } finally {
        setIsLoading(false);
    }
  }

  const updateAvatar = async (file: File) => {
    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', file);

      // Use server action to update avatar
      await updateAvatarAction(formData);

      // Fetch fresh data
      await fetchUserProfile();

    } catch( error){
      console.error("Error in updating profile avatar:", error);
      throw error;
    } finally{
      setIsUploadingAvatar(false);
    }
  }

  const deleteAvatar = async () => {
    try {
      setIsUploadingAvatar(true);

      // Use server action to delete avatar
      await deleteAvatarAction();

      // Fetch fresh data
      await fetchUserProfile();

    } catch (error) {
      console.error("Error in deleting profile avatar:", error);
      throw error;
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  const updateAuthCredential = async (authUpdateRequest: AuthDataUpdateRequest) => {
    try {
        setIsLoading(true);
        setUserProfileError(null);

        // Use server action to update auth
        await updateAuthAction(authUpdateRequest);

        // Fetch fresh data
        await fetchUserProfile();
    } catch (error) {
        console.error('Error updating auth credentials:', error);
        if (error && typeof error === 'object' && 'code' in error) {
            const errorCode = Number(error.code) || 9999;
            setUserProfileError(ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[9999]);
        } else {
            setUserProfileError(ERROR_MESSAGES[9999]);
        }
        // Error is logged, UI layer should handle user feedback
        throw error;
    } finally {
        setIsLoading(false);
    }
  }


  // Only fetching user based on its status is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserProfile();
    } else if (status === "unauthenticated") {
      setUserProfile(null);
      setAuthData(null);
    }
  }, [status]);

  // Value for consumer
  const value: UserProfileContextType = {
    userProfile,
    authData,
    isLoading,
    userProfileError,
    fetchUserProfile,
    refreshUserData,
    updateUserProfile,
    updateAuthCredential,
    updateAvatar,
    deleteAvatar
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}
export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
