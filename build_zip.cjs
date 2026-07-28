const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function createZip() {
  const zip = new JSZip();
  const distPath = path.join(__dirname, 'dist');
  
  function addDirectoryToZip(dirPath, zipFolder) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (item === 'estugadigital_react_build.zip') continue;
      
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        addDirectoryToZip(fullPath, zipFolder.folder(item));
      } else {
        const fileContent = fs.readFileSync(fullPath);
        zipFolder.file(item, fileContent);
      }
    }
  }

  if (!fs.existsSync(distPath)) {
    console.error('dist folder not found');
    process.exit(1);
  }

  console.log('Adding files to zip...');
  addDirectoryToZip(distPath, zip);
  
  console.log('Generating zip...');
  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  
  // Save to public so dev server can serve it
  fs.writeFileSync(path.join(__dirname, 'public', 'estugadigital_react_build.zip'), content);
  
  // Also save to dist so the build output contains it
  fs.writeFileSync(path.join(distPath, 'estugadigital_react_build.zip'), content);
  
  console.log('Zip created at public/ and dist/');
}

createZip().catch(console.error);
