#!/usr/bin/env node

/**
 * Version bump script with semantic versioning support
 * Usage: node scripts/bump-version.js [patch|minor|major]
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');

function parseVersion(version) {
  return version.split('.').map(Number);
}

function formatVersion(parts) {
  return parts.join('.');
}

function bumpVersion(currentVersion, type) {
  const parts = parseVersion(currentVersion);
  
  switch (type) {
    case 'major':
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1] += 1;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2] += 1;
      break;
  }
  
  return formatVersion(parts);
}

function updateVersion(newVersion) {
  try {
    // Update package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const oldVersion = packageJson.version;
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log(`✅ Version bumped: ${oldVersion} → ${newVersion}`);
    
    // Run sync script to update version.ts
    const { execSync } = require('child_process');
    execSync('npm run version:sync', { stdio: 'inherit' });
    
    console.log('📝 Updated both package.json and src/lib/version.ts');
    console.log('🚀 Ready for deployment!');
    
  } catch (error) {
    console.error('❌ Error bumping version:', error.message);
    process.exit(1);
  }
}

const bumpType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('❌ Invalid bump type. Use: patch, minor, or major');
  process.exit(1);
}

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  const newVersion = bumpVersion(currentVersion, bumpType);
  
  updateVersion(newVersion);
  
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  process.exit(1);
}
