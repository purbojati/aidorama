#!/usr/bin/env node

/**
 * Test script to simulate a version update
 * This script temporarily changes the version in package.json to test the refresh notification
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const versionLibPath = path.join(__dirname, '..', 'src', 'lib', 'version.ts');

function updateVersion(newVersion) {
  try {
    // Read current package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const originalVersion = packageJson.version;
    
    // Update package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Update version.ts
    const versionTsContent = fs.readFileSync(versionLibPath, 'utf8');
    const updatedVersionTs = versionTsContent.replace(
      /export const APP_VERSION = "[^"]+";/,
      `export const APP_VERSION = "${newVersion}";`
    );
    fs.writeFileSync(versionLibPath, updatedVersionTs);
    
    console.log(`✅ Version updated from ${originalVersion} to ${newVersion}`);
    console.log('📝 Remember to revert the changes after testing!');
    
    return originalVersion;
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

function revertVersion(originalVersion) {
  try {
    // Revert package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = originalVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Revert version.ts
    const versionTsContent = fs.readFileSync(versionLibPath, 'utf8');
    const revertedVersionTs = versionTsContent.replace(
      /export const APP_VERSION = "[^"]+";/,
      `export const APP_VERSION = "${originalVersion}";`
    );
    fs.writeFileSync(versionLibPath, revertedVersionTs);
    
    console.log(`✅ Version reverted to ${originalVersion}`);
  } catch (error) {
    console.error('❌ Error reverting version:', error.message);
  }
}

const command = process.argv[2];
const newVersion = process.argv[3];

if (command === 'update' && newVersion) {
  const originalVersion = updateVersion(newVersion);
  
  // Set up cleanup on process exit
  process.on('exit', () => revertVersion(originalVersion));
  process.on('SIGINT', () => {
    revertVersion(originalVersion);
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    revertVersion(originalVersion);
    process.exit(0);
  });
  
  console.log('\n🚀 Start your dev server and test the version notification!');
  console.log('Press Ctrl+C to revert the version changes.');
  
} else if (command === 'revert') {
  // This would need the original version, but for simplicity, we'll just use 0.4.0
  revertVersion('0.4.0');
} else {
  console.log('Usage:');
  console.log('  node scripts/test-version-update.js update <new-version>');
  console.log('  node scripts/test-version-update.js revert');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/test-version-update.js update 0.5.0');
}
