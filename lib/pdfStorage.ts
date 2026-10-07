/**
 * Persistent PDF Storage and In-Memory Cache for Sinav Studio
 * Uses IndexedDB for multi-megabyte persistence across browser sessions/reloads
 * Uses an in-memory singleton cache for instant 0ms restoration when reopening modals
 */

export interface StoredPdfRecord {
  id: string;
  name: string;
  data: ArrayBuffer;
  numPages: number;
  lastPage: number;
  updatedAt: number;
}

export interface CachedPdfItem {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any;
  numPages: number;
  lastPage: number;
  data?: ArrayBuffer;
}

const DB_NAME = 'sinav_studio_pdf_cache_v1';
const STORE_NAME = 'pdf_documents';
const DB_VERSION = 1;

// Global in-memory singleton cache for active session
const memoryPdfCache = new Map<string, CachedPdfItem>();
let lastActivePdfId: string | null = null;

function openPdfDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onblocked = () => {
        console.warn('IndexedDB blocked');
        resolve(null);
      };

      request.onerror = () => {
        console.warn('IndexedDB open error in Sinav Studio:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB not supported or blocked:', err);
      resolve(null);
    }
  });
}

/**
 * Save PDF data to both memory cache and IndexedDB
 */
export async function savePdfToStorage(item: {
  id: string;
  name: string;
  data: ArrayBuffer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any;
  numPages: number;
  lastPage?: number;
}): Promise<void> {
  const lastPage = item.lastPage || 1;

  // Make safe clones so PDF.js worker transfer doesn't detach buffer
  const memData = item.data.slice(0);
  const dbData = item.data.slice(0);

  // 1. In-memory cache (0ms instant access)
  memoryPdfCache.set(item.id, {
    id: item.id,
    name: item.name,
    doc: item.doc,
    numPages: item.numPages,
    lastPage,
    data: memData,
  });
  lastActivePdfId = item.id;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('sinav_studio_active_pdf_id', item.id);
    } catch {
      // ignore
    }
  }

  // 2. IndexedDB persistence (multi-session & reload safe)
  try {
    const db = await openPdfDb();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredPdfRecord = {
      id: item.id,
      name: item.name,
      data: dbData,
      numPages: item.numPages,
      lastPage,
      updatedAt: Date.now(),
    };

    store.put(record);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not persist PDF to IndexedDB:', err);
  }
}

/**
 * Update the last viewed page of a PDF
 */
export async function updatePdfLastPage(id: string, page: number): Promise<void> {
  const mem = memoryPdfCache.get(id);
  if (mem) {
    mem.lastPage = page;
  }
  lastActivePdfId = id;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('sinav_studio_active_pdf_id', id);
    } catch {
      // ignore
    }
  }

  try {
    const db = await openPdfDb();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const record = getReq.result as StoredPdfRecord | undefined;
      if (record) {
        record.lastPage = page;
        record.updatedAt = Date.now();
        store.put(record);
      }
    };
  } catch {
    // ignore
  }
}

/**
 * Remove a PDF from memory and IndexedDB
 */
export async function removeStoredPdf(id: string): Promise<void> {
  memoryPdfCache.delete(id);
  if (lastActivePdfId === id) {
    const remaining = Array.from(memoryPdfCache.keys());
    lastActivePdfId = remaining.length > 0 ? remaining[0] : null;
    if (typeof window !== 'undefined') {
      try {
        if (lastActivePdfId) {
          localStorage.setItem('sinav_studio_active_pdf_id', lastActivePdfId);
        } else {
          localStorage.removeItem('sinav_studio_active_pdf_id');
        }
      } catch {
        // ignore
      }
    }
  }

  try {
    const db = await openPdfDb();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.warn('Could not remove PDF from IndexedDB:', err);
  }
}

/**
 * Clear all stored PDFs from memory and IndexedDB
 */
export async function clearAllStoredPdfs(): Promise<void> {
  memoryPdfCache.clear();
  lastActivePdfId = null;

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('sinav_studio_active_pdf_id');
    } catch {
      // ignore
    }
  }

  try {
    const db = await openPdfDb();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch (err) {
    console.warn('Could not clear IndexedDB PDFs:', err);
  }
}

/**
 * Retrieve all PDFs. If in memory, returns immediately.
 * Otherwise restores from IndexedDB by parsing with PDF.js
 */
export async function loadAllPdfs(): Promise<{
  items: CachedPdfItem[];
  activeId: string | null;
}> {
  if (typeof window === 'undefined') {
    return { items: [], activeId: null };
  }

  // 1. If memory cache is already populated, return immediately (0ms)
  if (memoryPdfCache.size > 0) {
    let activeId = lastActivePdfId;
    if (!activeId) {
      try {
        activeId = localStorage.getItem('sinav_studio_active_pdf_id');
      } catch {
        // ignore
      }
    }
    const all = Array.from(memoryPdfCache.values());
    if (!activeId || !memoryPdfCache.has(activeId)) {
      activeId = all[0]?.id || null;
    }
    return {
      items: all,
      activeId,
    };
  }

  // 2. Otherwise restore from IndexedDB
  try {
    const db = await openPdfDb();
    if (!db) return { items: [], activeId: null };

    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const getAllReq = store.getAll();

    const records = await new Promise<StoredPdfRecord[]>((resolve, reject) => {
      getAllReq.onsuccess = () => resolve(getAllReq.result || []);
      getAllReq.onerror = () => reject(getAllReq.error);
    });

    if (!records || records.length === 0) {
      return { items: [], activeId: null };
    }

    // Initialize PDF.js
    const pdfjs = await import('pdfjs-dist');
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }

    // Sort by most recently used/updated first
    records.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    const loadedItems: CachedPdfItem[] = [];

    for (const record of records) {
      try {
        const sliceData = record.data.slice(0);
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(sliceData) });
        const doc = await loadingTask.promise;
        const cachedItem: CachedPdfItem = {
          id: record.id,
          name: record.name,
          doc,
          numPages: record.numPages || doc.numPages,
          lastPage: record.lastPage || 1,
          data: record.data,
        };
        memoryPdfCache.set(record.id, cachedItem);
        loadedItems.push(cachedItem);
      } catch (err) {
        console.error(`Failed to re-parse stored PDF ${record.name}:`, err);
      }
    }

    let activeId: string | null = null;
    try {
      activeId = localStorage.getItem('sinav_studio_active_pdf_id');
    } catch {
      // ignore
    }

    if (!activeId || !loadedItems.some((item) => item.id === activeId)) {
      activeId = loadedItems.length > 0 ? loadedItems[0].id : null;
    }
    lastActivePdfId = activeId;

    return {
      items: loadedItems,
      activeId,
    };
  } catch (err) {
    console.warn('Error loading PDFs from storage:', err);
    return { items: [], activeId: null };
  }
}

/**
 * Get active PDF ID
 */
export function getLastActivePdfId(): string | null {
  if (lastActivePdfId) return lastActivePdfId;
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('sinav_studio_active_pdf_id');
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Set active PDF ID
 */
export function setLastActivePdfId(id: string | null): void {
  lastActivePdfId = id;
  if (typeof window !== 'undefined') {
    try {
      if (id) {
        localStorage.setItem('sinav_studio_active_pdf_id', id);
      } else {
        localStorage.removeItem('sinav_studio_active_pdf_id');
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Get currently cached PDF count
 */
export function getStoredPdfCount(): number {
  return memoryPdfCache.size;
}
