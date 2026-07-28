const fs = require('fs');

let code = fs.readFileSync('src/components/PhpExporter.tsx', 'utf-8');

const targetStr = `        const targetDir = zipFolder.folder(targetFolder);
        if(targetDir) {
            targetDir.file(".htaccess", rootHtaccessCode.trim());
        }`;

const replacementStr = `        const targetDir = zipFolder.folder(targetFolder);
        if(targetDir) {
            targetDir.file(".htaccess", rootHtaccessCode.trim());
            
            // Menggabungkan hasil build React Frontend (jika tersedia)
            try {
                const res = await fetch("/estugadigital_react_build.zip");
                if (res.ok) {
                    const blob = await res.blob();
                    const reactZip = await JSZip.loadAsync(blob);
                    
                    const filePromises: Promise<void>[] = [];
                    reactZip.forEach((relativePath, file) => {
                        if (!file.dir) {
                            filePromises.push(
                                file.async("blob").then((fileBlob) => {
                                    targetDir.file(relativePath, fileBlob);
                                })
                            );
                        }
                    });
                    
                    // Tunggu semua file di ekstrak dan di copy ke folder public_html/htdocs
                    await Promise.all(filePromises);
                } else {
                    console.warn("Build React belum tersedia. Lakukan 'npm run build' terlebih dahulu.");
                }
            } catch (err) {
                console.warn("Gagal mengambil file react build: ", err);
            }
        }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/PhpExporter.tsx', code);
