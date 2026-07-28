const fs = require('fs');
let content = fs.readFileSync('src/components/CBTManager.tsx', 'utf8');

const regex = /<h4 className="text-\[10px\] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Galeri Referensi Gambar \(Soal Ini\)<\/h4>/;

const replacement = `<div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Galeri Referensi Gambar (Soal Ini)</h4>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const JSZip = (await import('jszip')).default;
                          const zip = new JSZip();
                          
                          const addImg = async (url, name) => {
                            if (!url) return;
                            try {
                              if (url.startsWith('data:')) {
                                const arr = url.split(',');
                                const bstr = atob(arr[1]);
                                let n = bstr.length;
                                const u8arr = new Uint8Array(n);
                                while (n--) { u8arr[n] = bstr.charCodeAt(n); }
                                const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
                                const ext = mime.split('/')[1] || 'png';
                                zip.file(\`\${name}.\${ext}\`, u8arr);
                              } else {
                                const res = await fetch(url);
                                const blob = await res.blob();
                                const ext = blob.type.split('/')[1] || 'png';
                                zip.file(\`\${name}.\${ext}\`, blob);
                              }
                            } catch (e) { console.error(e); }
                          };

                          await addImg(qImage, 'gambar_soal');
                          for (let i = 0; i < mcOptionImages.length; i++) {
                            await addImg(mcOptionImages[i], \`opsi_\${String.fromCharCode(65 + i)}\`);
                          }

                          const content = await zip.generateAsync({ type: 'blob' });
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(content);
                          link.download = 'galeri_soal.zip';
                          link.click();
                          URL.revokeObjectURL(link.href);
                        } catch (err) {
                          console.error(err);
                          alert('Gagal membuat file ZIP.');
                        }
                      }}
                      className="text-[9px] font-bold bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      ⬇️ Unduh ZIP
                    </button>
                  </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/CBTManager.tsx', content);

// Also do it for AssignmentManager.tsx
let assignContent = fs.readFileSync('src/components/AssignmentManager.tsx', 'utf8');
assignContent = assignContent.replace(regex, replacement);
fs.writeFileSync('src/components/AssignmentManager.tsx', assignContent);
