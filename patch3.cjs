const fs = require('fs');
let code = fs.readFileSync('src/mockData.ts', 'utf-8');

const newSave = `export const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(\`adminguruku_v2_\${key}\`, JSON.stringify(value));
      
      // Async sync to server (fails silently if api.php doesn't exist, e.g. in dev)
      fetch(\`api.php?action=save&key=\${key}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      }).catch(e => { /* Ignore */ });
      
    } catch (e: any) {
      console.error("Storage error:", e);
    }
  }
};

export const syncFromServer = async (): Promise<boolean> => {
  try {
    const res = await fetch('api.php?action=loadAll');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          localStorage.setItem(\`adminguruku_v2_\${key}\`, JSON.stringify(data[key]));
        });
        return true;
      }
    }
  } catch (e) {
    console.error("Failed to sync from server", e);
  }
  return false;
};
`;

code = code.replace(/export const saveToStorage = <T>\(key: string, value: T\): void => \{[\s\S]*?\}\n\s*\}/, newSave);

fs.writeFileSync('src/mockData.ts', code);
