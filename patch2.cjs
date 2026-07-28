const fs = require('fs');
let code = fs.readFileSync('src/mockData.ts', 'utf-8');

const newLoad = `export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(\`adminguruku_v2_\${key}\`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed === null || parsed === undefined) return defaultValue;
      return parsed;
    }
    return defaultValue;
  } catch (e) {
    console.error("Storage load error:", e);
    return defaultValue;
  }
};`;

code = code.replace(/export const loadFromStorage = <T>\(key: string, defaultValue: T\): T => \{[\s\S]*?\};\n?/, newLoad);

fs.writeFileSync('src/mockData.ts', code);
