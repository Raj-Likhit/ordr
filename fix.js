const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'app'));
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('export default') && !content.includes('export const')) {
    const baseName = path.basename(file, '.tsx').replace(/[^a-zA-Z0-9]/g, 'X');
    const safeName = baseName ? 'Component' + baseName : 'Page';
    const newContent = `import React from 'react';\n\nexport default function ${safeName}() {\n  return <div>${safeName}</div>;\n}\n`;
    fs.writeFileSync(file, newContent, 'utf8');
  }
}
