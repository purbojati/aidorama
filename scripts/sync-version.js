#!/usr/bin/env node

/**
 * Script to sync version between package.json and src/lib/version.ts
 * This ensures both files always have the same version
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const versionLibPath = path.join(__dirname, '..', 'src', 'lib', 'version.ts');

function syncVersionFromPackageJson() {
  try {
    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const packageVersion = packageJson.version;
    
    // Read current version.ts
    const versionTsContent = fs.readFileSync(versionLibPath, 'utf8');
    
    // Update version.ts with package.json version
    const updatedVersionTs = versionTsContent.replace(
      /export const APP_VERSION = "[^"]+";/,
      `export const APP_VERSION = "${packageVersion}";`
    );
    
    fs.writeFileSync(versionLibPath, updatedVersionTs);
    
    console.log(`✅ Synced version: ${packageVersion}`);
    console.log('📝 Updated src/lib/version.ts to match package.json');
    
  } catch (error) {
    console.error('❌ Error syncing version:', error.message);
    process.exit(1);
  }
}

function updateVersion(newVersion) {
  try {
    // Update package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Update version.ts
    const versionTsContent = fs.readFileSync(versionLibPath, 'utf8');
    const updatedVersionTs = versionTsContent.replace(
      /export const APP_VERSION = "[^"]+";/,
      `export const APP_VERSION = "${newVersion}";`
    );
    fs.writeFileSync(versionLibPath, updatedVersionTs);
    
    console.log(`✅ Updated version to: ${newVersion}`);
    console.log('📝 Updated both package.json and src/lib/version.ts');
    
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

const command = process.argv[2];
const newVersion = process.argv[3];

if (command === 'sync') {
  syncVersionFromPackageJson();
} else if (command === 'update' && newVersion) {
  updateVersion(newVersion);
} else {
  console.log('Usage:');
  console.log('  node scripts/sync-version.js sync                    # Sync version.ts with package.json');
  console.log('  node scripts/sync-version.js update <new-version>   # Update both files');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/sync-version.js sync');
  console.log('  node scripts/sync-version.js update 0.5.0');
}
