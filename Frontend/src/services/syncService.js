import api from './api';
import { db, removeFromOutbox } from './db';

let isSyncing = false;

export const syncService = {
  syncPendingResults: async (onSyncSuccess) => {
    if (isSyncing) return { status: 'syncing' };
    if (!navigator.onLine) return { status: 'offline' };

    try {
      const pendingItems = await db.syncOutbox.toArray();
      if (pendingItems.length === 0) {
        return { status: 'idle', count: 0 };
      }

      isSyncing = true;
      console.log(`Starting synchronization of ${pendingItems.length} offline MCQ attempts...`);

      let successCount = 0;
      let failureCount = 0;

      // Process chronologically (first in, first out)
      pendingItems.sort((a, b) => a.timestamp - b.timestamp);

      for (const item of pendingItems) {
        try {
          // Submit to backend
          await api.post(`/practice/${item.testId}/submit`, item.resultData);
          
          // Remove from local IndexedDB outbox queue
          await removeFromOutbox(item.id);
          successCount++;
          
          if (onSyncSuccess) {
            onSyncSuccess(item);
          }
        } catch (err) {
          console.error(`Failed to sync MCQ attempt ${item.id} (Test ${item.testId}):`, err);
          failureCount++;
          // Halt further sync attempts in this cycle to prevent out-of-order execution if network goes down again
          break;
        }
      }

      isSyncing = false;
      console.log(`Synchronization finished. Success: ${successCount}, Failures: ${failureCount}`);
      return {
        status: 'finished',
        successCount,
        failureCount,
        remaining: pendingItems.length - successCount
      };
    } catch (err) {
      isSyncing = false;
      console.error('Critical failure in syncPendingResults:', err);
      return { status: 'error', error: err.message };
    }
  }
};
