import { collection, doc, setDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Attendance, PrayerAttendance } from './types';

export const setupAttendanceSync = (
  localAttendance: Attendance[],
  setLocalAttendance: (att: Attendance[]) => void
) => {
  const attRef = collection(db, 'attendance');
  let isInitialized = false;

  const unsubscribe = onSnapshot(attRef, (snapshot) => {
    const remoteData = snapshot.docs.map(d => d.data() as Attendance);
    
    if (!isInitialized) {
      isInitialized = true;
      // Upload any local data that isn't in Firestore yet
      const remoteIds = new Set(remoteData.map(d => d.id));
      localAttendance.forEach(att => {
        if (!remoteIds.has(att.id)) {
          setDoc(doc(db, 'attendance', att.id), att).catch(console.error);
        }
      });
      // the snapshot will fire again after setDoc completes
    }
    
    // Always use remote data as the source of truth to sync across devices
    if (remoteData.length > 0 || isInitialized) {
      setLocalAttendance(remoteData);
    }
  });

  return unsubscribe;
};

export const addAttendanceToFirestore = async (att: Attendance) => {
  try {
    await setDoc(doc(db, 'attendance', att.id), att);
  } catch (err) {
    console.error("Failed to add attendance", err);
  }
};

export const setupPrayerAttendanceSync = (
  localPrayerAttendance: PrayerAttendance[],
  setLocalPrayerAttendance: (att: PrayerAttendance[]) => void
) => {
  const attRef = collection(db, 'prayerAttendance');
  let isInitialized = false;

  const unsubscribe = onSnapshot(attRef, (snapshot) => {
    const remoteData = snapshot.docs.map(d => d.data() as PrayerAttendance);
    
    if (!isInitialized) {
      isInitialized = true;
      const remoteIds = new Set(remoteData.map(d => d.id));
      localPrayerAttendance.forEach(att => {
        if (!remoteIds.has(att.id)) {
          setDoc(doc(db, 'prayerAttendance', att.id), att).catch(console.error);
        }
      });
    }
    
    if (remoteData.length > 0 || isInitialized) {
      setLocalPrayerAttendance(remoteData);
    }
  });

  return unsubscribe;
};

export const addPrayerAttendanceToFirestore = async (att: PrayerAttendance) => {
  try {
    await setDoc(doc(db, 'prayerAttendance', att.id), att);
  } catch (err) {
    console.error("Failed to add prayer attendance", err);
  }
};
