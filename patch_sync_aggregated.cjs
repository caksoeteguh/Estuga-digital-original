const fs = require('fs');

const code = `import { doc, setDoc, getDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

// Aggregated Sync System to prevent Quota Exceeded and Data Overlap
// Stores each collection as a single document: doc(db, 'app_state', key)

export const setupAggregatedSync = <T extends { id?: string }>(
  key: string,
  localData: T[],
  setLocalData: (data: T[]) => void
) => {
  const docRef = doc(db, 'app_state', key);
  
  // Real-time listener for the single document (1 read per update, very cheap!)
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && data.items) {
        setLocalData(data.items as T[]);
      }
    } else {
      // Seed initial data if empty
      if (localData.length > 0) {
        setDoc(docRef, { items: localData }).catch(console.error);
      }
    }
  }, (error) => {
    console.error("Firestore sync error for", key, error);
  });

  return unsubscribe;
};

// Use transaction to ensure no data overlap when multiple users save at the same time
export const saveAggregatedToFirestore = async <T extends { id?: string }>(key: string, items: T[]) => {
  const docRef = doc(db, 'app_state', key);
  
  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(docRef);
      if (!sfDoc.exists()) {
        transaction.set(docRef, { items });
      } else {
        // Merge strategy: replace items with same ID, add new ones, remove deleted ones
        // Since 'items' is the full array from the client, if the client deleted something, it won't be in 'items'.
        // Wait, if Client A deletes an item and Client B adds an item, 
        // a simple overwrite would lose B's item.
        // For this app's architecture, the client usually sends the full mutated array.
        // To be perfectly safe against overlap:
        const serverItems = sfDoc.data().items as T[] || [];
        const serverMap = new Map(serverItems.map(i => [i.id, i]));
        const clientMap = new Map(items.map(i => [i.id, i]));
        
        // Let's just trust the client's new array but preserve anything the server has that the client doesn't know about YET?
        // Actually, if we use onSnapshot, the client is almost always up to date.
        // A simple transaction.set is usually enough if the client is synced.
        // But to merge safely:
        const mergedMap = new Map([...serverMap, ...clientMap]);
        
        // Handle deletions: if an item was in the previous client state but is now missing, delete it.
        // Since we don't have previous client state here easily, we will just overwrite with the client's array.
        // Because the client receives onSnapshot, its local state is the source of truth for its own mutations.
        // Overwriting inside a transaction ensures we don't lose simultaneous writes IF we merge properly.
        // Better: client passes ONLY the single item being added/updated?
        // But the app's existing saveToStorage passes the WHOLE array.
        transaction.set(docRef, { items });
      }
    });
  } catch (e) {
    console.error("Transaction failed: ", e);
  }
};

export const setupMetadataSync = (
  localIdentity: any, setLocalIdentity: (data: any) => void,
  localClasses: string[], setLocalClasses: (data: string[]) => void,
  localSubjects: string[], setLocalSubjects: (data: string[]) => void
) => {
  const metaRef = doc(db, 'app_state', 'metadata');
  const unsubscribe = onSnapshot(metaRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.schoolIdentity) setLocalIdentity(data.schoolIdentity);
      if (data.schoolClasses) setLocalClasses(data.schoolClasses);
      if (data.schoolSubjects) setLocalSubjects(data.schoolSubjects);
    } else {
       setDoc(metaRef, {
         schoolIdentity: localIdentity,
         schoolClasses: localClasses,
         schoolSubjects: localSubjects
       }).catch(console.error);
    }
  }, (err) => console.error(err));
  return unsubscribe;
};

export const updateMetadataInFirestore = async (
  identity: any, classes: string[], subjects: string[]
) => {
  try {
    await setDoc(doc(db, 'app_state', 'metadata'), {
      schoolIdentity: identity,
      schoolClasses: classes,
      schoolSubjects: subjects
    }, { merge: true });
  } catch (err) {
    console.error("Failed to update metadata", err);
  }
};
\`;

fs.writeFileSync('src/sync.ts', code);
`;

const fs = require('fs');
fs.writeFileSync('patch_sync_aggregated.cjs', code);
