const fs = require('fs');
const path = require('path');

const assetsDirectory = path.join(__dirname, '..', 'public', 'assets');
if (fs.existsSync(assetsDirectory)) fs.rmSync(assetsDirectory, { recursive: true, force: true });
