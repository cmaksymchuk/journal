const fs = require('fs');
const path = require('path');

let loaded = false;

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value !== '') {
      process.env[key] = value;
    }
  }
}

function loadEnv() {
  if (loaded) return;

  const roots = [
    process.cwd(),
    path.join(__dirname, '..', '..'),
  ];

  for (const root of roots) {
    for (const name of ['.env.local', '.env']) {
      const envPath = path.join(root, name);
      if (!fs.existsSync(envPath)) continue;
      parseEnvFile(envPath);
      loaded = true;
      return;
    }
  }

  loaded = true;
}

module.exports = { loadEnv };
