const fs = require('fs');
let code = fs.readFileSync('src/components/PhpExporter.tsx', 'utf-8');

const htaccessCode = `
      // Generate .htaccess for Apache CORS & Clean URLs
      const htaccess = \`
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
\`;
      xamppFolder.file("api/.htaccess", htaccess.trim());
`;

// Insert the htaccess generation right before zip.generateAsync
code = code.replace(/const content = await zip\.generateAsync/g, htaccessCode + "\n      const content = await zip.generateAsync");

fs.writeFileSync('src/components/PhpExporter.tsx', code);
