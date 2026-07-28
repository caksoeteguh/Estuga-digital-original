#!/bin/bash
sed -i '/payloadToSync = stringified;/a \
      if (Array.isArray(value) && value.length > 0 && ["submissions", "results"].includes(key)) {\
         try {\
             const items = JSON.parse(stringified);\
             const getId = (item: any) => item.id || (item.examId && item.studentId ? item.examId + "_" + item.studentId : null);\
             for (let i = 0; i < items.length; i += 400) {\
                const batch = writeBatch(db);\
                const chunk = items.slice(i, i + 400);\
                chunk.forEach((item: any) => {\
                   const uid = getId(item);\
                   if (uid) batch.set(doc(db, key, uid), item, { merge: true });\
                });\
                await batch.commit();\
             }\
         } catch(e) {\
             console.warn("Firestore sync failed", e);\
         }\
      }\
' src/mockData.ts
