import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase (Auth only - data sync uses Supabase)
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google OAuth Provider
export const provider = new GoogleAuthProvider();

// Token cache
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let tokenObtainedAt: number = 0;

// Initialize auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  if (typeof window !== 'undefined' && !cachedAccessToken) {
    cachedAccessToken = localStorage.getItem('mei_pro_google_access_token');
    if (cachedAccessToken) tokenObtainedAt = Date.now();
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mei_pro_google_access_token');
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google sign-in
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Nao foi possivel obter o token de acesso do Google OAuth');
    }
    cachedAccessToken = credential.accessToken;
    tokenObtainedAt = Date.now();
    if (typeof window !== 'undefined') {
      localStorage.setItem('mei_pro_google_access_token', cachedAccessToken);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro de Autenticacao:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined' && !cachedAccessToken) {
    cachedAccessToken = localStorage.getItem('mei_pro_google_access_token');
    if (cachedAccessToken) tokenObtainedAt = Date.now();
  }
  return cachedAccessToken;
};

export const isTokenExpired = (): boolean => {
  if (!cachedAccessToken || tokenObtainedAt === 0) return true;
  return Date.now() - tokenObtainedAt > 50 * 60 * 1000;
};

export const clearAccessToken = () => {
  cachedAccessToken = null;
  tokenObtainedAt = 0;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mei_pro_google_access_token');
  }
};

export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mei_pro_google_access_token');
  }
};

export const getCurrentUser = () => auth.currentUser;
