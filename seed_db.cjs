const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function seed() {
  const teachers = [
    {
      id: "19850101",
      name: "Abdillah Putra",
      subject: "Matematika",
      classesTaught: "Kelas 1, Kelas 2",
      username: "abdillah_math",
      password: "guru123",
      isHomeroom: false
    }
  ];

  const students = [
    {
      id: "1024",
      name: "Ahmad Fauzi",
      pob: "Jakarta",
      dob: "2010-01-01",
      className: "Kelas 1",
      parentName: "Budi",
      parentPhone: "08123456789",
      religion: "Islam",
      gender: "Laki-laki",
      usernameCbt: "ahmad1024",
      passwordCbt: "cbt123",
      usernameParent: "parent_ahmad",
      passwordParent: "parent123"
    }
  ];

  await setDoc(doc(db, 'app_data', 'teachers'), { data: JSON.stringify(teachers), updatedAt: new Date() });
  await setDoc(doc(db, 'app_data', 'students'), { data: JSON.stringify(students), updatedAt: new Date() });
  console.log("Seeded successfully");
  process.exit(0);
}

seed().catch(console.error);
