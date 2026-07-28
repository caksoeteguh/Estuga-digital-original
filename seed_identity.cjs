const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function seed() {
  const schoolIdentity = {
    name: "SDN Teladan Bangsa",
    address: "Jl. Pendidikan No. 1",
    phone: "021-12345678",
    email: "info@sdnteladan.sch.id",
    kepsekName: "Budi Santoso, M.Pd",
    kepsekNip: "19700101",
    adminEmail: "admin",
    adminPassword: "admin",
    kepsekEmail: "kepsek",
    kepsekPassword: "kepsek"
  };

  await setDoc(doc(db, 'app_data', 'school_identity'), { data: JSON.stringify(schoolIdentity), updatedAt: new Date() });
  console.log("Seeded identity successfully");
  process.exit(0);
}

seed().catch(console.error);
