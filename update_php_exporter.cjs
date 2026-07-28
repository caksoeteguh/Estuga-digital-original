const fs = require('fs');
let code = fs.readFileSync('src/components/PhpExporter.tsx', 'utf-8');

code = code.replace(/estugadigital_V6/g, 'estugadigital_v7');
// Make sure database name string is also matched
code = code.replace(/estugadigital_V6\.sql/g, 'estugadigital_v7.sql');

fs.writeFileSync('src/components/PhpExporter.tsx', code);
