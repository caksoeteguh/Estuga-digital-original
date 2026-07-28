const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /{renderTabContent\(\)}/,
  '<Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>\n            {renderTabContent()}\n          </Suspense>'
);

fs.writeFileSync('src/App.tsx', code);
