"use client";

import { useEffect, useState } from "react";
import { APP_VERSION, isNewerVersion } from "@/lib/version";

interface VersionInfo {
  current: string;
  latest: string;
  hasUpdate: boolean;
}

export function useVersionCheck() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    current: typeof window !== "undefined" ? (window as any).__APP_VERSION__ || APP_VERSION : APP_VERSION,
    latest: APP_VERSION,
    hasUpdate: false,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      // Check if we have a cached version check
      const cachedCheck = localStorage.getItem("version-check");
      const cacheTime = localStorage.getItem("version-check-time");
      
      // If we checked recently (within 5 minutes), use cached result
      if (cachedCheck && cacheTime) {
        const timeDiff = Date.now() - parseInt(cacheTime);
        if (timeDiff < 5 * 60 * 1000) { // 5 minutes
          const cached = JSON.parse(cachedCheck);
          setVersionInfo(cached);
          setLastChecked(new Date(parseInt(cacheTime)));
          setIsChecking(false);
          return;
        }
      }

      // Fetch current version from API
      const response = await fetch("/api/version", {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const currentVersion = typeof window !== "undefined" ? (window as any).__APP_VERSION__ || APP_VERSION : APP_VERSION;
        const hasUpdate = isNewerVersion(currentVersion, data.version);
        
        const newVersionInfo = {
          current: currentVersion,
          latest: data.version,
          hasUpdate,
        };
        
        setVersionInfo(newVersionInfo);
        setLastChecked(new Date());
        
        // Cache the result
        localStorage.setItem("version-check", JSON.stringify(newVersionInfo));
        localStorage.setItem("version-check-time", Date.now().toString());
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const refreshApp = () => {
    // Clear all caches and reload
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    // Clear localStorage cache
    localStorage.removeItem("version-check");
    localStorage.removeItem("version-check-time");
    
    // Force reload
    window.location.reload();
  };

  useEffect(() => {
    // Check for updates on mount
    checkForUpdates();
    
    // Set up periodic checking (every 10 minutes)
    const interval = setInterval(checkForUpdates, 10 * 60 * 1000);
    
    // Listen for focus events to check when user returns to tab
    const handleFocus = () => {
      checkForUpdates();
    };
    
    window.addEventListener("focus", handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return {
    versionInfo,
    isChecking,
    lastChecked,
    checkForUpdates,
    refreshApp,
  };
}
