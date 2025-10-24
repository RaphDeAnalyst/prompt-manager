const DB_NAME = 'PromptManagerDB';
const DB_VERSION = 1;
const STORE_NAME = 'prompts';
const BACKUP_STORAGE_KEY = 'prompts_backup'; // JSON backup storage

let db = null;

/**
 * Initialize IndexedDB with proper error handling and validation
 * Always reopens the connection to ensure it's valid (in case DB was deleted)
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      db = null; // Reset cached connection on error
      reject(new Error(`Failed to open IndexedDB: ${request.error}`));
    };

    request.onsuccess = () => {
      const database = request.result;

      // Validate the database is usable
      try {
        // Test that object store exists
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          throw new Error(`Object store "${STORE_NAME}" not found`);
        }
      } catch (error) {
        db = null;
        database.close();
        reject(error);
        return;
      }

      db = database;

      // Handle unexpected database closure
      database.onclose = () => {
        console.warn('IndexedDB connection closed unexpectedly');
        db = null;
      };

      resolve(database);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      try {
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
          console.log('Created IndexedDB object store:', STORE_NAME);
        }
      } catch (error) {
        console.error('Error during database upgrade:', error);
        reject(error);
      }
    };

    // Handle blocked event (another connection is open)
    request.onblocked = () => {
      console.warn('IndexedDB open blocked - close other tabs using this app');
    };
  });
};

/**
 * Get all prompts from IndexedDB
 * Falls back to backup storage if IndexedDB fails
 */
export const getPrompts = async () => {
  try {
    // Try IndexedDB first
    await initDB();

    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database connection failed'));
        return;
      }

      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const prompts = request.result;
          const sorted = prompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          resolve(sorted);
        };
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.warn('IndexedDB unavailable, attempting to load from backup storage:', error.message);

    // Try to load from backup storage (JSON backup)
    try {
      const backupData = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        console.log('Loaded prompts from backup storage');
        return parsed;
      }
    } catch (parseError) {
      console.warn('Backup storage corrupted:', parseError.message);
    }

    // Return empty array if everything fails
    console.warn('No data available - returning empty array');
    return [];
  }
};

/**
 * Save prompts to IndexedDB with JSON backup as failsafe
 * IndexedDB = primary storage (survives cache clear if not deleted)
 * JSON backup = secondary storage (JSON format for manual inspection)
 */
export const savePrompts = async (prompts) => {
  let indexedDBSuccess = false;
  let backupSuccess = false;

  // Try IndexedDB first
  try {
    await initDB();

    await new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database connection unavailable'));
        return;
      }

      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // Clear existing data
        store.clear();

        // Add new data
        prompts.forEach(prompt => store.add(prompt));

        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => {
          indexedDBSuccess = true;
          resolve();
        };
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.warn('IndexedDB save failed:', error.message);
    db = null; // Reset connection
  }

  // Always save JSON backup as failsafe
  try {
    const jsonString = JSON.stringify(prompts, null, 2);
    localStorage.setItem(BACKUP_STORAGE_KEY, jsonString);
    backupSuccess = true;
    console.log('Saved prompts to JSON backup storage');
  } catch (error) {
    console.error('Failed to save backup storage:', error.message);
  }

  // Throw error only if both failed
  if (!indexedDBSuccess && !backupSuccess) {
    throw new Error('Failed to save prompts to both IndexedDB and backup storage');
  }

  if (!indexedDBSuccess) {
    console.warn('[WARNING] IndexedDB unavailable - only backup storage is active');
  }

  return { indexedDBSuccess, backupSuccess };
};

/**
 * Add a new prompt
 * @param {Object} prompt - Prompt data (title, content, category, tags)
 * @returns {Promise<Object>} The newly created prompt with ID and creation date
 */
export const addPrompt = async (prompt) => {
  const prompts = await getPrompts();
  const newPrompt = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...prompt
  };
  prompts.push(newPrompt);
  await savePrompts(prompts);
  return newPrompt;
};

/**
 * Update an existing prompt
 * @param {string} id - Prompt ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated prompt or null if not found
 */
export const updatePrompt = async (id, updates) => {
  const prompts = await getPrompts();
  const index = prompts.findIndex(p => p.id === id);
  if (index !== -1) {
    prompts[index] = { ...prompts[index], ...updates };
    await savePrompts(prompts);
    return prompts[index];
  }
  return null;
};

/**
 * Delete a prompt
 * @param {string} id - Prompt ID to delete
 * @returns {Promise<void>}
 */
export const deletePrompt = async (id) => {
  const prompts = await getPrompts();
  const filtered = prompts.filter(p => p.id !== id);
  await savePrompts(filtered);
};

/**
 * Export all prompts as a downloadable JSON file
 * This is the RECOMMENDED way to backup data
 * @returns {Promise<void>}
 */
export const exportPrompts = async () => {
  const prompts = await getPrompts();
  const dataStr = JSON.stringify(prompts, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `prompts-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import prompts from a JSON file
 * Merges with existing prompts (doesn't replace them)
 * @param {File} file - JSON file from exportPrompts()
 * @returns {Promise<Array>} All prompts after import
 */
export const importPrompts = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedPrompts = JSON.parse(e.target.result);
        if (!Array.isArray(importedPrompts)) {
          throw new Error('Invalid format: expected an array of prompts');
        }

        const currentPrompts = await getPrompts();
        const merged = [...currentPrompts, ...importedPrompts];
        await savePrompts(merged);
        resolve(merged);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

/**
 * Check storage health and availability
 * Useful for debugging storage issues
 * @returns {Promise<Object>} Storage status information
 */
export const getStorageStatus = async () => {
  const status = {
    indexedDBAvailable: false,
    backupStorageAvailable: false,
    promptsInIndexedDB: 0,
    promptsInBackup: 0,
    error: null
  };

  // Check IndexedDB
  try {
    await initDB();
    const prompts = await new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    status.indexedDBAvailable = true;
    status.promptsInIndexedDB = prompts.length;
  } catch (error) {
    status.error = error.message;
  }

  // Check Backup Storage
  try {
    const backupData = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (backupData) {
      const parsed = JSON.parse(backupData);
      status.backupStorageAvailable = true;
      status.promptsInBackup = parsed.length;
    }
  } catch (error) {
    console.warn('Backup storage check failed:', error.message);
  }

  return status;
};
