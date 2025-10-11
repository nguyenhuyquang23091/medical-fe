"use server"

import profileService from "./profile";
import authService from "../auth/auth";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { ProfileUpdateRequest, AuthDataUpdateRequest } from "@/types";

// Server action to update profile
export async function updateProfileAction(updateRequest: ProfileUpdateRequest) {
  try {
    // Get server-side session and token
    const session = await auth();

    if (!session?.accessToken) {
      throw new Error("No valid session or access token");
    }
    // Update profile via unified service with token
    const result = await profileService.updateProfile(updateRequest, session.accessToken);

    console.log("Profile updated");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

// Server action to update auth credentials
export async function updateAuthAction(updateRequest: AuthDataUpdateRequest) {
  try {
    // Get server-side session and token
    const session = await auth();

    if (!session?.accessToken) {
      throw new Error("No valid session or access token");
    }

    // Update auth via unified service with token
    const result = await authService.updateInfo(updateRequest, session.accessToken);

    console.log("Auth credentials updated");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating auth credentials:", error);
    throw error;
  }
}


// Server action to upload avatar
export async function updateAvatarAction(formData: FormData) {
  try {
    // Get server-side session and token
    const session = await auth();

    if (!session?.accessToken) {
      throw new Error("No valid session or access token");
    }
    // Update avatar via unified service with token
    const result = await profileService.updateProfileAvatar(formData, session.accessToken);

    console.log("Avatar updated");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
}

// Server action to delete avatar
export async function deleteAvatarAction() {
  try {
    // Get server-side session and token
    const session = await auth();

    if (!session?.accessToken) {
      throw new Error("No valid session or access token");
    }

    // Delete avatar via unified service with token
    const result = await profileService.deleteProfileAvatar(session.accessToken);

    console.log("Avatar deleted");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting avatar:", error);
    throw error;
  }
}