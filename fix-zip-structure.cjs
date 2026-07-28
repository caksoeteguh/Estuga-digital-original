const fs = require('fs');
let code = fs.readFileSync('src/components/PhpExporter.tsx', 'utf-8');

// Replace targetFolder/api with just api
code = code.replace("const apiFolder = zipFolder.folder(`${targetFolder}/api`);", "const apiFolder = zipFolder.folder(`api`);");

// Replace targetFolder for targetDir with just root (we don't need a subfolder)
// Instead of const targetDir = zipFolder.folder(targetFolder); 
// we just use zipFolder directly.
code = code.replace("const targetDir = zipFolder.folder(targetFolder);", "const targetDir = zipFolder;");

// Fix readme instructions because there is no more public_html or htdocs inside the zip
const readmeTarget = `10. Upload seluruh isi dari folder "public_html" yang ada di paket zip ini ke dalam public_html di cPanel Anda.`;
const readmeTargetReplacement = `10. Upload seluruh isi dari paket zip ini ke dalam public_html di cPanel Anda (atau htdocs di XAMPP).`;
code = code.replace(readmeTarget, readmeTargetReplacement);

fs.writeFileSync('src/components/PhpExporter.tsx', code);
