/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, doc, getDoc, setDoc, deleteDoc, getDocs, collection, 
  onSnapshot, getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { AppSettings, Passenger } from './types';

// Force fallback to secure local/offline storage mode
export const isFirebaseEnabled = false;

let app;
let db: any = null;
let auth: any = null;

if (isFirebaseEnabled) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
    auth = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase SDK:", error);
  }
}

export { db, auth };

// --- Error Handling Interface (Mandatory) ---
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot as requested by skill guidelines
export async function testFirestoreConnection() {
  if (!isFirebaseEnabled || !db) return;
  try {
    // Attempt fetch from connection test doc
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client appears to be offline. Verify your Firebase configuration.");
    }
  }
}

if (isFirebaseEnabled) {
  testFirestoreConnection();
}

// --- High Level API Helpers with Precise Error Boundaries ---

/**
 * Save Global Settings database document
 */
export async function saveSettingsToServer(settings: AppSettings): Promise<void> {
  if (!isFirebaseEnabled || !db) return;
  const docPath = 'settings/app';
  try {
    await setDoc(doc(db, 'settings', 'app'), settings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

/**
 * Fetch Global Settings database document
 */
export async function loadSettingsFromServer(): Promise<AppSettings | null> {
  if (!isFirebaseEnabled || !db) return null;
  const docPath = 'settings/app';
  try {
    const snap = await getDoc(doc(db, 'settings', 'app'));
    return snap.exists() ? (snap.data() as AppSettings) : null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, docPath);
  }
}

/**
 * Save / Update a Pilgrim Passenger document
 */
export async function savePassengerToServer(passenger: Passenger): Promise<void> {
  if (!isFirebaseEnabled || !db) return;
  const docPath = `passengers/${passenger.id}`;
  try {
    await setDoc(doc(db, 'passengers', passenger.id), passenger);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

/**
 * Delete a Pilgrim Passenger document
 */
export async function deletePassengerFromServer(id: string): Promise<void> {
  if (!isFirebaseEnabled || !db) return;
  const docPath = `passengers/${id}`;
  try {
    await deleteDoc(doc(db, 'passengers', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

/**
 * Real-time active listener for passenger records
 */
export function listenToPassengersServer(
  onData: (data: Passenger[]) => void, 
  onError: (err: Error) => void
): () => void {
  if (!isFirebaseEnabled || !db) {
    return () => {};
  }
  const collPath = 'passengers';
  return onSnapshot(
    collection(db, collPath),
    (snapshot) => {
      const list: Passenger[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Passenger);
      });
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, collPath);
      } catch (mappedError: any) {
        onError(mappedError);
      }
    }
  );
}

/**
 * Fetch all passengers in single call
 */
export async function loadPassengersFromServer(): Promise<Passenger[]> {
  if (!isFirebaseEnabled || !db) return [];
  const collPath = 'passengers';
  try {
    const snapshot = await getDocs(collection(db, collPath));
    const list: Passenger[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Passenger);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, collPath);
  }
}
