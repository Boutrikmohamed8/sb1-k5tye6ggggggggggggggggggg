import { WilayaData } from '../types';

const DB_NAME = 'WilayaDatabase';
const STORE_NAME = 'wilayaData';
const HISTORY_STORE_NAME = 'historicalData';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);

    request.onerror = () => reject("Error opening database");

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: ['id', 'date'] });
      }
      
      if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
        db.createObjectStore(HISTORY_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const initDatabase = async (): Promise<void> => {
  await openDB();
};

export const saveWilayaData = async (wilayaData: WilayaData): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(wilayaData);

    request.onerror = () => reject("Error saving wilaya data");
    request.onsuccess = () => resolve();
  });
};

export const getWilayaData = async (id: string, date: string): Promise<WilayaData | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get([id, date]);

    request.onerror = () => reject("Error getting wilaya data");
    request.onsuccess = () => resolve(request.result || null);
  });
};

export const getAllWilayaData = async (id: string): Promise<WilayaData[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll(IDBKeyRange.bound([id, ''], [id, '\uffff']));

    request.onerror = () => reject("Error getting all wilaya data");
    request.onsuccess = () => resolve(request.result);
  });
};

export const saveHistoricalData = async (id: string, history: WilayaData[]): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HISTORY_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(HISTORY_STORE_NAME);
    const request = store.put({ id, data: history });

    request.onerror = () => reject("Error saving historical data");
    request.onsuccess = () => resolve();
  });
};

export const getHistoricalData = async (id: string): Promise<WilayaData[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HISTORY_STORE_NAME, 'readonly');
    const store = transaction.objectStore(HISTORY_STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject("Error getting historical data");
    request.onsuccess = () => resolve(request.result ? request.result.data : []);
  });
};