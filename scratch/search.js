const fs = require('fs');
const path = require('path');
function search(dir, regex) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      search(fullPath, regex);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (regex.test(content)) {
        console.log(fullPath);
      }
    }
  }
}
search('./app', /supabase\.from|createClient/);
search('./lib', /supabase\.from|createClient/);
search('./components', /supabase\.from|createClient/);
search('./src/modules', /supabase\.from|createClient/);
