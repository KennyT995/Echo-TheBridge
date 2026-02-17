"use client";
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { logger } from "@/lib/logger";

// This function is now internal to this module.
const createUserProfile = async (userCredential: UserCredential) => {
  const user = userCredential.user;
  if (!user) return;

  const displayName = user.displayName || user.email?.split("@")[0] || "User";

  // We want to update the auth user profile as well
  if (!user.displayName) {
    // We don't want to block on this, but we should handle errors.
    await updateProfile(user, { displayName }).catch((e) =>
      logger.warn("Failed to update auth profile display name", e),
    );
  }

  const userRef = doc(getFirestore(), "users", user.uid);
  const userData = {
    id: user.uid,
    email: user.email,
    displayName: displayName,
    planTierId: "trailblazer", // Default plan
  };

  // This is a critical step, so we await it and let errors propagate.
  await setDoc(userRef, userData);
};

/**
 * Handles email/password sign-up. Creates auth user and user profile document.
 * If profile creation fails, it deletes the auth user to prevent inconsistent state.
 */
export async function signUpWithEmail(
  auth: Auth,
  email: string,
  password: string,
): Promise<void> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  try {
    await createUserProfile(userCredential);
  } catch {
    // If profile creation fails, delete the auth user to clean up.
    try {
      await userCredential.user.delete();
    } catch (deleteError) {
      logger.error("Failed to clean up orphaned auth user.", deleteError);
      // Even if cleanup fails, we must inform the user that the process failed.
      throw new Error(
        "An unexpected error occurred during sign-up. Your account may be in an inconsistent state. Please contact support.",
      );
    }
    // Re-throw a more user-friendly error.
    throw new Error(
      "Account created, but failed to set up user profile. Please try again or contact support.",
    );
  }
}

/** Handles email/password sign-in. */
export async function signInWithEmail(
  auth: Auth,
  email: string,
  password: string,
): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}
