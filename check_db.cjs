const { initializeApp } = require('firebase/app');
const { getFirestore, getDocs, collection } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const snapshot = await getDocs(collection(db, 'app_data'));
  snapshot.forEach(doc => {
    console.log(doc.id, typeof doc.data().data, String(doc.data().data).substring(0, 100));
  });
  process.exit(0);
}

check().catch(console.error);
