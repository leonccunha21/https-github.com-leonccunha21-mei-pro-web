import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use named database if specified, otherwise default
const dbId =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

// Setup OAuth Google Provider
export const provider = new GoogleAuthProvider();
// Add required Google Workspace scopes
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

// Flags and cache
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let tokenObtainedAt: number = 0;

// Initialize auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  // Restore cached accessToken from localStorage if available
  if (typeof window !== 'undefined' && !cachedAccessToken) {
    cachedAccessToken = localStorage.getItem('mei_pro_google_access_token');
    if (cachedAccessToken) tokenObtainedAt = Date.now(); // assume recently obtained
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mei_pro_google_access_token');
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google sign-in trigger
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google OAuth');
    }

    cachedAccessToken = credential.accessToken;
    tokenObtainedAt = Date.now();
    if (typeof window !== 'undefined') {
      localStorage.setItem('mei_pro_google_access_token', cachedAccessToken);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro de Autenticação:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve cached access token
export const getAccessToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined' && !cachedAccessToken) {
    cachedAccessToken = localStorage.getItem('mei_pro_google_access_token');
    if (cachedAccessToken) tokenObtainedAt = Date.now();
  }
  return cachedAccessToken;
};

// Check if token is likely expired (> 50 minutes old)
export const isTokenExpired = (): boolean => {
  if (!cachedAccessToken || tokenObtainedAt === 0) return true;
  return Date.now() - tokenObtainedAt > 50 * 60 * 1000;
};

// Force clear token (on auth errors)
export const clearAccessToken = () => {
  cachedAccessToken = null;
  tokenObtainedAt = 0;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mei_pro_google_access_token');
  }
};

// Sign out trigger
export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mei_pro_google_access_token');
  }
};

// FIRESTORE ERROR HANDLING
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
