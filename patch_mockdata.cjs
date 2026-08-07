const fs = require('fs');
let code = fs.readFileSync('src/mockData.ts', 'utf8');

// Replace syncArrayToFirestore with saveAggregatedToFirestore
code = code.replace("import { syncArrayToFirestore } from './utils/diffSync';", "import { saveAggregatedToFirestore } from './sync';");

// Inside saveToStorage, replace syncArrayToFirestore(collectionsMap[key], value);
const search = `      if (collectionsMap[key] && Array.isArray(value)) {
        syncArrayToFirestore(collectionsMap[key], value);
      }`;
const insert = `      if (collectionsMap[key] && Array.isArray(value)) {
        saveAggregatedToFirestore(collectionsMap[key], value as any[]);
      }`;

code = code.replace(search, insert);

fs.writeFileSync('src/mockData.ts', code);
