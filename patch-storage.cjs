const fs = require('fs');
let code = fs.readFileSync('src/mockData.ts', 'utf-8');

const newSave = `export const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(\`adminguruku_v2_\${key}\`, JSON.stringify(value));
    } catch (e: any) {
      console.error("Storage error:", e);
      if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
        alert("PERINGATAN: Memori browser penuh! Data tidak dapat disimpan. Ini sering terjadi jika Anda mengimpor terlalu banyak data ke dalam mode prototipe ini.");
      }
    }
  }
};`;

code = code.replace(/export const saveToStorage = <T>\(key: string, value: T\): void => \{[\s\S]*?\};\n?/, newSave);

fs.writeFileSync('src/mockData.ts', code);
