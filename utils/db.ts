import type { User, Transaction, Budget, Settings } from '../types';

const DB_NAME = 'HomeBudgetDB';
const DB_VERSION = 1;
const USERS_STORE = 'users';
const TRANSACTIONS_STORE = 'transactions';
const BUDGETS_STORE = 'budgets';
const SETTINGS_STORE = 'settings';

let db: IDBDatabase;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Database error');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(USERS_STORE)) {
        dbInstance.createObjectStore(USERS_STORE, { keyPath: 'email' });
      }
      if (!dbInstance.objectStoreNames.contains(TRANSACTIONS_STORE)) {
        const store = dbInstance.createObjectStore(TRANSACTIONS_STORE, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
      }
      if (!dbInstance.objectStoreNames.contains(BUDGETS_STORE)) {
        // Use a composite key for budgets, since a user has one budget per category
        const store = dbInstance.createObjectStore(BUDGETS_STORE, { keyPath: ['userId', 'category'] });
        store.createIndex('userId', 'userId', { unique: false });
      }
       if (!dbInstance.objectStoreNames.contains(SETTINGS_STORE)) {
        // userId is the key
        dbInstance.createObjectStore(SETTINGS_STORE, { keyPath: 'userId' });
      }
    };
  });
}

// Generic function to perform a transaction
async function performTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  const db = await openDB();
  const transaction = db.transaction(storeName, mode);
  const store = transaction.objectStore(storeName);
  return new Promise((resolve, reject) => {
    action(store).then(resolve).catch(reject);
    transaction.oncomplete = () => {};
    transaction.onerror = () => reject(transaction.error);
  });
}

// User operations
export const dbGetAllUsers = (): Promise<User[]> => {
  return performTransaction(USERS_STORE, 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  });
};

export const dbGetUser = (email: string): Promise<User | undefined> => {
   return performTransaction(USERS_STORE, 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.get(email);
      request.onsuccess = () => resolve(request.result);
    });
  });
}

export const dbSaveUser = (user: User): Promise<void> => {
  return performTransaction(USERS_STORE, 'readwrite', (store) => {
     return new Promise((resolve) => {
        const request = store.put(user);
        request.onsuccess = () => resolve();
     });
  });
};

// Transaction operations
export const dbGetTransactions = (userId: string): Promise<Transaction[]> => {
  return performTransaction(TRANSACTIONS_STORE, 'readonly', (store) => {
    return new Promise((resolve) => {
      const index = store.index('userId');
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
  });
};

export const dbAddTransaction = (transaction: Transaction, userId: string): Promise<void> => {
  return performTransaction(TRANSACTIONS_STORE, 'readwrite', (store) => {
    return new Promise((resolve) => {
      // Add userId to transaction object for indexing
      const request = store.add({ ...transaction, userId });
      request.onsuccess = () => resolve();
    });
  });
};

export const dbUpdateTransaction = (transaction: Transaction, userId: string): Promise<void> => {
  return performTransaction(TRANSACTIONS_STORE, 'readwrite', (store) => {
    return new Promise((resolve) => {
      const request = store.put({ ...transaction, userId });
      request.onsuccess = () => resolve();
    });
  });
};


export const dbDeleteTransaction = (transactionId: string): Promise<void> => {
   return performTransaction(TRANSACTIONS_STORE, 'readwrite', (store) => {
    return new Promise((resolve) => {
      const request = store.delete(transactionId);
      request.onsuccess = () => resolve();
    });
  });
};

// Budget operations
export const dbGetBudgets = (userId: string): Promise<Budget[]> => {
   return performTransaction(BUDGETS_STORE, 'readonly', (store) => {
    return new Promise((resolve) => {
      const index = store.index('userId');
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
    });
  });
};

export const dbSetBudget = (budget: Budget, userId: string): Promise<void> => {
  return performTransaction(BUDGETS_STORE, 'readwrite', (store) => {
    return new Promise((resolve) => {
      // Add userId to budget object for indexing
      const request = store.put({ ...budget, userId });
      request.onsuccess = () => resolve();
    });
  });
};

export const dbDeleteBudget = (category: string, userId: string): Promise<void> => {
  return performTransaction(BUDGETS_STORE, 'readwrite', (store) => {
    return new Promise((resolve) => {
      const request = store.delete([userId, category]);
      request.onsuccess = () => resolve();
    });
  });
};

// Settings operations
export interface UserSettings extends Settings {
    theme: 'light' | 'dark';
}
export const dbGetSettings = (userId: string): Promise<UserSettings | undefined> => {
   return performTransaction(SETTINGS_STORE, 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result ? request.result.settings : undefined);
    });
  });
};

export const dbSaveSettings = (userId: string, settings: UserSettings): Promise<void> => {
  return performTransaction(SETTINGS_STORE, 'readwrite', (store) => {
    return new Promise((resolve) => {
      const request = store.put({ userId, settings });
      request.onsuccess = () => resolve();
    });
  });
};

// Delete user data
export const dbDeleteUserData = async (userId: string): Promise<void> => {
  const transactions = await dbGetTransactions(userId);
  for (const t of transactions) {
    await dbDeleteTransaction(t.id);
  }
  
  const budgets = await dbGetBudgets(userId);
  for (const b of budgets) {
    await dbDeleteBudget(b.category, userId);
  }

  await performTransaction(SETTINGS_STORE, 'readwrite', (store) => {
    return new Promise<void>(resolve => {
        store.delete(userId);
        resolve();
    });
  });
  
  await performTransaction(USERS_STORE, 'readwrite', (store) => {
    return new Promise<void>(resolve => {
        store.delete(userId); // Assuming userId is the email
        resolve();
    });
  });
};