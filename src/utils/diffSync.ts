import { addGenericToFirestore, deleteGenericFromFirestore } from '../sync';

// Global store to keep track of the last known state to calculate diffs
export const previousStates: Record<string, any[]> = {};

export const syncArrayToFirestore = (collectionName: string, currentArray: any[]) => {
  const prevArray = previousStates[collectionName] || [];
  
  const prevMap = new Map(prevArray.map(item => [item.id, item]));
  const currentMap = new Map(currentArray.map(item => [item.id, item]));

  // Find added or updated items
  currentArray.forEach(item => {
    if (!item.id) return;
    const prevItem = prevMap.get(item.id);
    if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
      addGenericToFirestore(collectionName, item);
    }
  });

  // Find deleted items
  prevArray.forEach(item => {
    if (!item.id) return;
    if (!currentMap.has(item.id)) {
      deleteGenericFromFirestore(collectionName, item.id);
    }
  });

  previousStates[collectionName] = currentArray;
};
