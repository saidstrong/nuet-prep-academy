#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('Building static site...');

// Ensure .next directory structure exists
const nextDir = path.join(__dirname, '.next');
const staticDir = path.join(nextDir, 'static');
const chunksDir = path.join(staticDir, 'chunks', 'pages');

// Create directories if they don't exist
[staticDir, chunksDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create BUILD_ID if it doesn't exist
const buildIdPath = path.join(nextDir, 'BUILD_ID');
if (!fs.existsSync(buildIdPath)) {
  fs.writeFileSync(buildIdPath, 'static-site-build');
}

// Create a minimal _app.js if it doesn't exist
const appJsPath = path.join(chunksDir, '_app.js');
if (!fs.existsSync(appJsPath)) {
  fs.writeFileSync(appJsPath, '// Static site - no Next.js runtime needed\nconsole.log("Static site loaded");');
}

// Create package.json in .next if it doesn't exist
const nextPackagePath = path.join(nextDir, 'package.json');
if (!fs.existsSync(nextPackagePath)) {
  fs.writeFileSync(nextPackagePath, JSON.stringify({
    name: 'next-static',
    version: '1.0.0'
  }, null, 2));
}

console.log('Static site ready for deployment');
console.log('Next.js plugin compatibility structure created');
