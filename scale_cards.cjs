const fs = require('fs');

const scale = 1.465;

function replaceSizes(content) {
  const safeRegex = /(width|height|fontSize|padding|paddingTop|paddingBottom|marginTop|marginBottom|marginLeft|marginRight):\s*'([0-9.]+)mm'/g;
  
  content = content.replace(safeRegex, (match, prop, val) => {
    if (val === '210' || val === '297') {
        return match;
    }
    const scaled = (parseFloat(val) * scale).toFixed(1).replace(/\.0$/, '');
    return `${prop}: '${scaled}mm'`;
  });
  
  return content;
}

for (const file of ['src/components/BulkPrintCards.tsx', 'src/components/BulkPrintStaffCards.tsx']) {
  let text = fs.readFileSync(file, 'utf8');
  text = replaceSizes(text);
  // Also fix print:gap-[4mm]
  text = text.replace(/gap-\[4mm\]/g, 'gap-[6mm]');
  fs.writeFileSync(file, text);
}
