#!/bin/bash
sed -i '1i import { db } from "./firebase";\nimport { collection, doc, writeBatch, getDocs, setDoc } from "firebase/firestore";' src/mockData.ts
