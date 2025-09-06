// Version management utilities
export const APP_VERSION = "0.11.0";

export function getVersionFromPackageJson(): string {
  try {
    // This will be replaced at build time with the actual version
    return APP_VERSION;
  } catch {
    return "0.4.0";
  }
}

export function compareVersions(version1: string, version2: string): number {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
}

export function isNewerVersion(current: string, latest: string): boolean {
  return compareVersions(latest, current) > 0;
}
