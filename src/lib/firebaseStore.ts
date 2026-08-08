import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { compressImageDataUrl } from './imageCompressor';

/**
 * Settings Collection Helpers
 */
export async function saveSettingToFirestore(key: string, value: string) {
  try {
    let valToSave = value || '';

    // If string is large base64 data URL (>250KB), compress it first
    if (valToSave.startsWith('data:image/') && valToSave.length > 250000) {
      try {
        valToSave = await compressImageDataUrl(valToSave, 800, 800, 0.7);
      } catch (cErr) {
        console.warn('Compression error for key:', key, cErr);
      }
    }

    // Safety guard: Firestore has a 1,048,576 byte (1MB) document size limit.
    // If string is still > 900,000 chars, do not write raw oversized base64 to Firestore to avoid errors.
    if (valToSave.length > 900000) {
      console.warn(`[Firestore Safe Guard] Setting '${key}' is too large (${valToSave.length} bytes) for direct Firestore document sync. Skipping Firestore write for this key to prevent 1MB limit crash.`);
      return false;
    }

    const docRef = doc(db, 'settings', key);
    await setDoc(docRef, { key, value: valToSave, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error(`Firestore saveSetting error for '${key}':`, err);
    return false;
  }
}

export async function saveAllSettingsToFirestore(settingsObj: Record<string, string>) {
  try {
    const promises = Object.entries(settingsObj).map(([key, value]) =>
      saveSettingToFirestore(key, value)
    );
    const results = await Promise.allSettled(promises);
    const hasFailures = results.some((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value));
    return !hasFailures;
  } catch (err) {
    console.error('Firestore saveAllSettings error:', err);
    return false;
  }
}

export async function getSettingsFromFirestore(): Promise<Record<string, string>> {
  try {
    const querySnapshot = await getDocs(collection(db, 'settings'));
    const result: Record<string, string> = {};
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.key && data.value !== undefined) {
        result[data.key] = data.value;
      }
    });
    return result;
  } catch (err) {
    console.error('Firestore getSettings error:', err);
    return {};
  }
}

/**
 * Applications Collection Helpers
 */
export async function saveApplicationToFirestore(appData: any) {
  try {
    const docId = appData.application_no || appData.id || `APP-${Date.now()}`;
    const docRef = doc(db, 'applications', String(docId));
    await setDoc(
      docRef,
      {
        ...appData,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Firestore saveApplication error:', err);
    return false;
  }
}

export async function getApplicationsFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, 'applications'));
    const apps: any[] = [];
    querySnapshot.forEach((docSnap) => {
      apps.push({ id: docSnap.id, ...docSnap.data() });
    });
    return apps;
  } catch (err) {
    console.error('Firestore getApplications error:', err);
    return [];
  }
}

/**
 * Services Collection Helpers
 */
export async function saveServiceToFirestore(serviceData: any) {
  try {
    const docId = serviceData.id ? String(serviceData.id) : `SRV-${Date.now()}`;
    const docRef = doc(db, 'services', docId);
    await setDoc(docRef, { ...serviceData, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore saveService error:', err);
    return false;
  }
}

/**
 * Expenses Collection Helpers
 */
export async function saveExpenseToFirestore(expenseData: any) {
  try {
    const docId = expenseData.id ? String(expenseData.id) : `EXP-${Date.now()}`;
    const docRef = doc(db, 'expenses', docId);
    await setDoc(docRef, { ...expenseData, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore saveExpense error:', err);
    return false;
  }
}

/**
 * Center Photos Collection Helpers
 */
export async function saveCenterPhotoToFirestore(photoData: any) {
  try {
    const docId = photoData.id ? String(photoData.id) : `PHOTO-${Date.now()}`;
    const docRef = doc(db, 'center_photos', docId);
    await setDoc(docRef, { ...photoData, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore saveCenterPhoto error:', err);
    return false;
  }
}

/**
 * Sync entire local database to Firestore
 */
export async function syncLocalDbToFirestore() {
  try {
    // Fetch settings from local API
    const settingsRes = await fetch('/api/admin/settings');
    if (settingsRes.ok) {
      const settingsObj = await settingsRes.json();
      await saveAllSettingsToFirestore(settingsObj);
    }

    // Fetch services from local API
    const servicesRes = await fetch('/api/services');
    if (servicesRes.ok) {
      const servicesArr = await servicesRes.json();
      for (const s of servicesArr) {
        await saveServiceToFirestore(s);
      }
    }

    return true;
  } catch (err) {
    console.error('Firestore sync error:', err);
    return false;
  }
}
