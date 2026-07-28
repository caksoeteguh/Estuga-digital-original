const { initializeApp } = require("firebase/app");
const { getFirestore, doc, deleteDoc } = require("firebase/firestore");

// Using admin is not easily available, but we can just use a regular web script if we have the config.
// Better yet, I'll just write a small Node script if needed, but since we ignore it in syncFromServer, it won't be loaded anyway.
