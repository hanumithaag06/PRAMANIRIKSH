import { TestAnalysisResponse } from '../types';

const DB_NAME = 'pramaniriksh_offline_db';
const DB_VERSION = 1;
const STORE_TESTS = 'offline_tests';

export function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_TESTS)) {
        db.createObjectStore(STORE_TESTS, { keyPath: 'temp_id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineTest(testData: any): Promise<string> {
  const db = await openOfflineDb();
  const temp_id = `OFFLINE-${Date.now()}`;
  const record = {
    temp_id,
    ...testData,
    saved_at: new Date().toISOString(),
    sync_status: 'LOCAL_UNVERIFIED'
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TESTS, 'readwrite');
    const store = tx.objectStore(STORE_TESTS);
    const req = store.put(record);
    req.onsuccess = () => resolve(temp_id);
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineTests(): Promise<any[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TESTS, 'readonly');
    const store = tx.objectStore(STORE_TESTS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function clearOfflineTests(): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TESTS, 'readwrite');
    const store = tx.objectStore(STORE_TESTS);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
