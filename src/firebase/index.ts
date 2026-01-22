'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (getApps().length === 0) {
    // When not in production, always use the explicit firebaseConfig.
    // In production, App Hosting provides the configuration automatically.
    if (process.env.NODE_ENV !== 'production') {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      try {
        // In production, try auto-initialization first.
        firebaseApp = initializeApp();
      } catch (e) {
        console.warn(
          'Automatic initialization failed. Falling back to firebase config object.',
          e
        );
        // Fallback to explicit config if auto-init fails even in production.
        firebaseApp = initializeApp(firebaseConfig);
      }
    }
  } else {
    firebaseApp = getApp();
  }

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return {
    firebaseApp,
    auth,
    firestore,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
