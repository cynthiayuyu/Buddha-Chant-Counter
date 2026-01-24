import { auth, db } from './config';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { ChantRecord, UserSettings, Sutra } from '../types';

// Sign in anonymously
export const signInAnonymouslyUser = async (): Promise<User> => {
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};

// Get user ID (backup code)
export const getUserBackupCode = (): string | null => {
  return auth.currentUser?.uid || null;
};

// Sync records to Firestore
export const syncRecords = async (records: ChantRecord[]): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const docRef = doc(db, 'users', userId, 'data', 'records');
  await setDoc(docRef, { records });
};

// Sync settings to Firestore
export const syncSettings = async (settings: UserSettings): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const docRef = doc(db, 'users', userId, 'data', 'settings');
  await setDoc(docRef, { settings });
};

// Sync sutras to Firestore
export const syncSutras = async (sutras: Sutra[]): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const docRef = doc(db, 'users', userId, 'data', 'sutras');
  await setDoc(docRef, { sutras });
};

// Load records from Firestore
export const loadRecords = async (): Promise<ChantRecord[] | null> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const docRef = doc(db, 'users', userId, 'data', 'records');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().records as ChantRecord[];
  }
  return null;
};

// Load settings from Firestore
export const loadSettings = async (): Promise<UserSettings | null> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const docRef = doc(db, 'users', userId, 'data', 'settings');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().settings as UserSettings;
  }
  return null;
};

// Load sutras from Firestore
export const loadSutras = async (): Promise<Sutra[] | null> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const docRef = doc(db, 'users', userId, 'data', 'sutras');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().sutras as Sutra[];
  }
  return null;
};

// Listen to real-time updates for records
export const subscribeToRecords = (
  callback: (records: ChantRecord[]) => void
): Unsubscribe | null => {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const docRef = doc(db, 'users', userId, 'data', 'records');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().records as ChantRecord[]);
    }
  });
};

// Listen to real-time updates for settings
export const subscribeToSettings = (
  callback: (settings: UserSettings) => void
): Unsubscribe | null => {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const docRef = doc(db, 'users', userId, 'data', 'settings');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().settings as UserSettings);
    }
  });
};

// Listen to real-time updates for sutras
export const subscribeToSutras = (
  callback: (sutras: Sutra[]) => void
): Unsubscribe | null => {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const docRef = doc(db, 'users', userId, 'data', 'sutras');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().sutras as Sutra[]);
    }
  });
};
