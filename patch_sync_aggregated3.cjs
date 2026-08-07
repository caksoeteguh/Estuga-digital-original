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
        const clientMap = new Map(items.map(i => [i.id, i]));
        
        // Items in server that client doesn't have (concurrent additions by others)
        const concurrentAdditions = serverItems.filter(si => !clientMap.has(si.id));
        
        let mergedItems = [...items];
        
        // If there are concurrent additions (e.g. another student submitted a result),
        // but the client array doesn't have them, we MUST preserve them!
        // The ONLY exception is if the client explicitly deleted them.
        // But since this app passes the whole array on every save, 
        // to be extremely safe against data loss during concurrent CBT submissions:
        // We will append concurrentAdditions if they were added recently.
        // For simplicity and maximum safety against "tumpang tindih" for results/attendance:
        
        if (concurrentAdditions.length > 0 && (key === 'results' || key === 'submissions' || key === 'attendance')) {
            mergedItems = [...items, ...concurrentAdditions];
        }

        transaction.set(docRef, { items: mergedItems });
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
`;

fs.writeFileSync('src/sync.ts', code);
