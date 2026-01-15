'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type ErrorCallback = (error: any) => void;

// Function to create a user profile document
const createUserProfile = async (userCredential: UserCredential) => {
  const user = userCredential.user;
  if (!user) return;
  
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  // We want to update the auth user profile as well
  if (!user.displayName) {
    await updateProfile(user, { displayName }).catch(e => console.error("Failed to update auth profile", e));
  }

  const userRef = doc(getFirestore(), 'users', user.uid);
  const userData = {
    id: user.uid,
    email: user.email,
    displayName: displayName,
    planTierId: 'trailblazer', // Default plan
  };
  
  // This is a non-blocking write. We don't wait for it to complete.
  setDoc(userRef, userData).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: userRef.path,
        operation: 'create',
        requestResourceData: userData,
      })
    );
  });
};

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, onError?: ErrorCallback): void {
  signInAnonymously(authInstance).catch(onError);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, onError?: ErrorCallback): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(createUserProfile) // Create profile on successful sign-up
    .catch(onError);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError?: ErrorCallback): void {
  signInWithEmailAndPassword(authInstance, email, password).catch(onError);
}
