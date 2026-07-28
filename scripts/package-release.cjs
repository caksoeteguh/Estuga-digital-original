const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const tempZipPath = path.join(__dirname, '../estugadigital_build_temp.zip');
const finalZipPath = path.join(__dirname, '../public/estugadigital_react_build.zip');

const output = fs.createWriteStream(tempZipPath);
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', function() {
  console.log('Zip created, moving to public...');
  fs.renameSync(tempZipPath, finalZipPath);
  console.log('Build package ready at public/estugadigital_react_build.zip');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Exclude the zip file itself if it happens to be in dist
archive.glob('**/*', { 
    cwd: path.join(__dirname, '../dist'),
    ignore: ['estugadigital_react_build.zip']
});

archive.finalize();
