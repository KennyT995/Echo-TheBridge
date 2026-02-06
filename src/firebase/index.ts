"use client";

import { firebaseConfig } from "@/firebase/config";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!firebaseConfig.apiKey) {
    const errorMsg = "Firebase API Key is missing. Check your .env.local file and restart the dev server. Values found: " + JSON.stringify({
      hasProjectId: !!firebaseConfig.projectId,
      hasAppId: !!firebaseConfig.appId,
      hasApiKey: !!firebaseConfig.apiKey,
    });
    console.error(errorMsg);
    // In dev, we might want to throw to catch it early
    if (process.env.NODE_ENV !== "production") {
      throw new Error(errorMsg);
    }
  }

  let firebaseApp: FirebaseApp;

  if (getApps().length === 0) {
    if (process.env.NODE_ENV !== "production") {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      try {
        firebaseApp = initializeApp();
      } catch (e) {
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

export * from "./provider";
export * from "./client-provider";
export * from "./firestore/use-collection";
export * from "./firestore/use-doc";
export * from "./non-blocking-updates";
export * from "./non-blocking-login";
export * from "./errors";
export * from "./error-emitter";
