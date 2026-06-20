const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('route.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'app', 'api'));
for (const file of files) {
  const newContent = `import { NextResponse } from 'next/server';\n\nexport async function GET() {\n  return NextResponse.json({ status: 'ok' });\n}\n`;
  fs.writeFileSync(file, newContent, 'utf8');
}
