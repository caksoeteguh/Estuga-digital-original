#!/bin/bash
sed -i '/if (result.data) {/a \
        try {\
          for (const key of ["submissions", "results"]) {\
            const snap = await getDocs(collection(db, key));\
            const firestoreItems = snap.docs.map(d => d.data());\
            if (firestoreItems.length > 0) {\
               let currentArr = result.data[key] ? JSON.parse(typeof result.data[key] === "string" ? result.data[key] : JSON.stringify(result.data[key])) : [];\
               if (!Array.isArray(currentArr)) currentArr = [];\
               const mergedMap = new Map();\
               const getId = (item: any) => item.id || (item.examId && item.studentId ? item.examId + "_" + item.studentId : JSON.stringify(item));\
               currentArr.forEach((i: any) => { const id = getId(i); if(id) mergedMap.set(id, i); });\
               firestoreItems.forEach((i: any) => { const id = getId(i); if(id) mergedMap.set(id, i); });\
               result.data[key] = JSON.stringify(Array.from(mergedMap.values()));\
            }\
          }\
        } catch(e) { console.warn("Firestore syncFromServer failed", e); }\
' src/mockData.ts
