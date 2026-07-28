const fs = require('fs');
let code = fs.readFileSync('src/mockData.ts', 'utf-8');
const oldLoad = `export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(\`adminguruku_v2_\${key}\`);
  return stored ? JSON.parse(stored) : defaultValue;
};`;
const newLoad = `export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(\`adminguruku_v2_\${key}\`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error("Storage load error:", e);
    return defaultValue;
  }
};`;
code = code.replace(oldLoad, newLoad);
fs.writeFileSync('src/mockData.ts', code);
