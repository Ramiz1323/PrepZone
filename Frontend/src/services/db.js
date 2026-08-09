import Dexie from 'dexie';

export const db = new Dexie('PrepZoneOfflineDB');

// Define database schema
// Note: We only index the properties we want to query/filter by.
db.version(1).stores({
  tests: '_id, subject, topic',
  activeTests: 'testId',
  syncOutbox: '++id, testId, timestamp'
});

// Helper functions for outbox operations
export const addToOutbox = async (testId, resultData) => {
  return await db.syncOutbox.add({
    testId,
    resultData,
    timestamp: Date.now()
  });
};

export const getOutboxCount = async () => {
  return await db.syncOutbox.count();
};

export const getOutboxItems = async () => {
  return await db.syncOutbox.toArray();
};

export const removeFromOutbox = async (id) => {
  return await db.syncOutbox.delete(id);
};
