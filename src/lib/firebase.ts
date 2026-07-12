import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User,
  connectAuthEmulator
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use named database if specified, otherwise default
const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
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

// Initialize auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  // Restore cached accessToken from localStorage if available
  if (typeof window !== 'undefined' && !cachedAccessToken) {
    cachedAccessToken = localStorage.getItem('mei_pro_google_access_token');
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

// Token expiry tracking
let tokenObtainedAt: number = 0;
const TOKEN_LIFETIME_MS = 55 * 60 * 1000; // 55 minutes (tokens last ~1h)

// Retrieve cached access token, refresh if expired
export const getAccessToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined' && !cachedAccessToken) {
    cachedAccessToken = localStorage.getItem('mei_pro_google_access_token');
  }

  // If token exists but may be expired, try to refresh via re-authentication
  if (cachedAccessToken && tokenObtainedAt > 0 && Date.now() - tokenObtainedAt > TOKEN_LIFETIME_MS) {
    console.log('Token expirado, tentando refresh...');
    const refreshed = await refreshAccessToken();
    if (refreshed) return refreshed;
  }

  return cachedAccessToken;
};

// Try to refresh the Google OAuth access token by re-authenticating silently
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    // Re-authenticate with popup to get fresh token
    const credential = await signInWithPopup(auth, provider);
    const newCredential = GoogleAuthProvider.credentialFromResult(credential);
    if (newCredential?.accessToken) {
      cachedAccessToken = newCredential.accessToken;
      tokenObtainedAt = Date.now();
      if (typeof window !== 'undefined') {
        localStorage.setItem('mei_pro_google_access_token', cachedAccessToken);
      }
      console.log('Token refreshed com sucesso');
      return cachedAccessToken;
    }
  } catch (err) {
    console.error('Falha ao refresh token:', err);
    // If refresh fails, clear token so user re-authenticates manually
    cachedAccessToken = null;
    tokenObtainedAt = 0;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mei_pro_google_access_token');
    }
  }
  return null;
};

// Sign out trigger
export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mei_pro_google_access_token');
  }
};

// FIRESTORE ERROR HANDLING AS REQUIRED BY SKILL
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
  }
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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
