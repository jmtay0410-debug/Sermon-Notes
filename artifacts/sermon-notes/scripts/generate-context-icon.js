const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const base64Path = path.join(root, 'assets', 'images', 'context-logo-base64.txt');
const iconPath = path.join(root, 'assets', 'images', 'context-icon.generated.png');

const base64 = fs.readFileSync(base64Path, 'utf8').trim();
const buffer = Buffer.from(base64, 'base64');

fs.writeFileSync(iconPath, buffer);
console.log('Context app icon generated.');
