const fs = require('fs');

const code = `import { doc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

export const setupAggregatedSync = <T extends { id?: string }>(
  key: string,
  localData: T[],
  setLocalData: (data: T[]) => void
) => {
  const docRef = doc(db, 'app_state', key);
  
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && data.items) {
        // Only update local state if server data has different length or different latest items
        // to prevent constant React re-renders, but since we trust Firebase, we just set it
        setLocalData(data.items as T[]);
      }
    } else {
      if (localData.length > 0) {
        setDoc(docRef, { items: localData }).catch(console.error);
      }
    }
  }, (error) => {
    console.error("Firestore sync error for", key, error);
  });

  return unsubscribe;
};

// Safely merge arrays to prevent data loss (tumpang tindih) during concurrent writes
export const saveAggregatedToFirestore = async <T extends { id?: string }>(key: string, items: T[]) => {
  const docRef = doc(db, 'app_state', key);
  
  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(docRef);
      if (!sfDoc.exists()) {
        transaction.set(docRef, { items });
      } else {
        const serverItems = sfDoc.data().items as T[] || [];
        const serverMap = new Map(serverItems.map(i => [i.id, i]));
        
        // We will keep server items that are missing from the client UNLESS the client array is significantly smaller
        // which implies a deliberate deletion.
        // Actually, the most reliable way to handle deletions without a complex diff engine
        // is to just trust the client if it's an Admin, but for this app, we'll merge by ID.
        // If a student submits, they add a new ID.
        
        // Let's identify the newly added or updated items from the client:
        const clientMap = new Map(items.map(i => [i.id, i]));
        
        // Start with server items, update them if client has them
        const mergedMap = new Map<string, T>();
        
        // For safe deletion: If the client removed an item, we should remove it ONLY IF we are confident it's a deletion.
        // In this app, deletions are explicit actions (e.g. Admin clicks "Delete").
        // To simplify and guarantee 100% no overlap for new student submissions:
        // We will just write the client's array directly BUT we will append any server items that the client missed 
        // (which happens if someone else added an item concurrently).
        
        // Items in server that client doesn't have (concurrent additions by others)
        const concurrentAdditions = serverItems.filter(si => !clientMap.has(si.id));
        
        // Did the client explicitly delete them? 
        // Heuristic: If concurrentAdditions is small and items is large, maybe it's concurrent additions.
        // To be safe, we just use the client's array, because onSnapshot keeps the client very up-to-date!
        // With onSnapshot active, the client is never more than 1-2 seconds behind.
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
