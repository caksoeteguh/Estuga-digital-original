const fs = require('fs');

let content = fs.readFileSync('src/components/StaffIdCard.tsx', 'utf8');

// Replace imports
content = content.replace(
  /import \{ renderStaffIdCardToCanvas \} from '\.\.\/utils\/cardRenderer';/,
  `import { toPng } from 'html-to-image';
import { useReactToPrint } from 'react-to-print';`
);

// Replace downloading state and add ref
content = content.replace(
  /const hiddenCanvasRef = useRef<HTMLCanvasElement \| null>\(null\);/,
  `const cardRef = useRef<HTMLDivElement>(null);`
);

// Replace handlePrintSingle
content = content.replace(
  /const handlePrintSingle = \(\) => \{[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?try \{ window\.print\(\); \} catch\(e\) \{ console\.error\(e\); \}[\s\S]*?const cleanup = \(\) => \{[\s\S]*?document\.body\.classList\.remove\('single-print-active'\);[\s\S]*?setIsPrintingSingle\(false\);[\s\S]*?window\.removeEventListener\('afterprint', cleanup\);[\s\S]*?\};[\s\S]*?window\.addEventListener\('afterprint', cleanup\);[\s\S]*?setTimeout\(cleanup, 1500\);[\s\S]*?\}, 150\);[\s\S]*?\};/,
  `const handlePrintSingle = useReactToPrint({
    content: () => cardRef.current,
    documentTitle: \`Kartu_Guru_\${staff.name}\`,
    onBeforeGetContent: () => {
      setIsPrintingSingle(true);
      return Promise.resolve();
    },
    onAfterPrint: () => setIsPrintingSingle(false),
    onPrintError: () => setIsPrintingSingle(false)
  });`
);

// Replace handleDownloadPng
content = content.replace(
  /const handleDownloadPng = async \(\) => \{[\s\S]*?const canvas = hiddenCanvasRef\.current;[\s\S]*?if \(!canvas\) return;[\s\S]*?setDownloading\(true\);[\s\S]*?try \{[\s\S]*?await renderStaffIdCardToCanvas\([\s\S]*?\);[\s\S]*?\/\/ Save\/Download Action[\s\S]*?const link = document\.createElement\('a'\);[\s\S]*?link\.download = \`kartu_id_guru_\$\{staff\.name\.toLowerCase\(\)\.replace\(\/\\s\+\/g, '_'\)\}_\$\{staff\.id\}\.png\`;[\s\S]*?link\.href = canvas\.toDataURL\('image\/png'\);[\s\S]*?document\.body\.appendChild\(link\);[\s\S]*?link\.click\(\);[\s\S]*?document\.body\.removeChild\(link\);[\s\S]*?setDownloadSuccess\(true\);[\s\S]*?setTimeout\(\(\) => setDownloadSuccess\(false\), 2000\);[\s\S]*?\} catch \(e\) \{[\s\S]*?console\.error\('Failed to download PNG:', e\);[\s\S]*?\} finally \{[\s\S]*?setDownloading\(false\);[\s\S]*?\}[\s\S]*?\};/,
  `const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: 'transparent' });
      const link = document.createElement('a');
      link.download = \`kartu_id_guru_\${staff.name.toLowerCase().replace(/\\s+/g, '_')}_\${staff.id}.png\`;
      link.href = dataUrl;
      link.click();
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to download PNG:', e);
    } finally {
      setDownloading(false);
    }
  };`
);

// We must also remove `<canvas ref={hiddenCanvasRef} className="hidden" width={560} height={850} />`
content = content.replace(
  /<canvas ref=\{hiddenCanvasRef\} className="hidden" width=\{560\} height=\{850\} \/>/,
  ''
);

// Remove the inline style injection for @media print body.single-print-active
content = content.replace(
  /<style>\{`[\s\S]*?@media print \{[\s\S]*?body\.single-print-active[\s\S]*?`\}<\/style>/,
  ''
);

// Now attach the ref to the card element.
content = content.replace(
  /<div className={`relative flex flex-col w-full text-center px-4 pt-4 pb-4 overflow-hidden shadow-2xl shrink-0 print-active-overlay`}/,
  `<div ref={cardRef} className={\`relative flex flex-col w-full text-center px-4 pt-4 pb-4 overflow-hidden shadow-2xl shrink-0 print-active-overlay\`}`
);


fs.writeFileSync('src/components/StaffIdCard.tsx', content);
console.log('StaffIdCard updated');
