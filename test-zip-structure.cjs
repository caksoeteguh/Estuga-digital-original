const JSZip = require('jszip');

async function test() {
    const zip = new JSZip();
    const type = 'xampp';
    const isCpanel = type === 'cpanel';
    const rootFolderName = isCpanel ? "estugadigital_cpanel" : "estugadigital_xampp";
    const targetFolder = isCpanel ? "public_html" : "htdocs";
    const zipFolder = zip.folder(rootFolderName);
      
    // Add SQL schema
    if(zipFolder) {
        zipFolder.file("database_schema/estugadigital_v7.sql", "SQL");
        
        // Add PHP API files
        const apiFolder = zipFolder.folder(`${targetFolder}/api`);
        if(apiFolder) {
            apiFolder.file("db.php", "PHP");
        }
    }
    const targetDir = zipFolder.folder(targetFolder);
    targetDir.file(".htaccess", "HTACCESS");
    targetDir.file("index.html", "HTML");
    
    const content = Object.keys(zip.files);
    console.log(content);
}

test();
