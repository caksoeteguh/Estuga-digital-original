import { collection, doc, setDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Attendance, PrayerAttendance } from './types';
import { previousStates } from './utils/diffSync';

export const setupGenericSync = <T extends { id?: string }>(
  collectionName: string,
  localData: T[],
  setLocalData: (data: T[]) => void
) => {
  const colRef = collection(db, collectionName);
  let isInitialized = false;
  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    const remoteData = snapshot.docs.map(d => d.data() as T);
    
    if (!isInitialized) {
      isInitialized = true;
      const remoteIds = new Set(remoteData.map(d => d.id));
      localData.forEach(item => {
        if (item.id && !remoteIds.has(item.id)) {
          setDoc(doc(db, collectionName, item.id), item).catch(console.error);
        }
      });
    }
    
    // Update the diff baseline so syncArrayToFirestore doesn't push back
    previousStates[collectionName] = remoteData;
    
    if (remoteData.length > 0 || isInitialized) {
      setLocalData(remoteData);
    }
  });
  return unsubscribe;
};

export const addGenericToFirestore = async <T extends { id?: string }>(collectionName: string, item: T) => {
  try {
    if (!item.id) return;
    await setDoc(doc(db, collectionName, item.id), item);
  } catch (err) {
    console.error(`Failed to add to ${collectionName}`, err);
  }
};

export const deleteGenericFromFirestore = async (collectionName: string, id: string) => {
  try {
    const { deleteDoc, doc } = await import('firebase/firestore');
    await deleteDoc(doc(db, collectionName, id));
  } catch (err) {
    console.error(`Failed to delete from ${collectionName}`, err);
  }
}

export const setupAttendanceSync = (
  localAttendance: Attendance[],
  setLocalAttendance: (att: Attendance[]) => void
) => setupGenericSync('attendance', localAttendance, setLocalAttendance);

export const addAttendanceToFirestore = async (att: Attendance) => addGenericToFirestore('attendance', att);

export const setupPrayerAttendanceSync = (
  localPrayerAttendance: PrayerAttendance[],
  setLocalPrayerAttendance: (att: PrayerAttendance[]) => void
) => setupGenericSync('prayerAttendance', localPrayerAttendance, setLocalPrayerAttendance);

export const addPrayerAttendanceToFirestore = async (att: PrayerAttendance) => addGenericToFirestore('prayerAttendance', att);
