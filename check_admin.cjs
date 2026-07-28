const { initializeApp } = require('firebase/app');
const { getFirestore, getDoc, doc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const d = await getDoc(doc(db, 'app_data', 'school_identity'));
  if (d.exists()) {
    console.log(d.data().data);
  }
  process.exit(0);
}

check().catch(console.error);
