"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, RefreshCw, Download } from "lucide-react";
import { useVersionCheck } from "@/hooks/use-version-check";
import { cn } from "@/lib/utils";

export function VersionRefreshNotification() {
  const { versionInfo, isChecking, refreshApp } = useVersionCheck();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this version update
    const dismissedVersion = localStorage.getItem("dismissed-version");
    if (dismissedVersion === versionInfo.latest) {
      setIsDismissed(true);
      return;
    }

    // Show notification if there's an update
    if (versionInfo.hasUpdate) {
      setIsVisible(true);
    }
  }, [versionInfo.hasUpdate, versionInfo.latest]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("dismissed-version", versionInfo.latest);
  };

  const handleRefresh = () => {
    refreshApp();
  };

  if (!isVisible || isDismissed || !versionInfo.hasUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 shadow-lg">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Update Tersedia
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Versi {versionInfo.latest} telah tersedia
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-3 flex gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isChecking}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isChecking ? "Memuat..." : "Refresh Sekarang"}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
            >
              Nanti
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            Versi saat ini: {versionInfo.current} → Versi terbaru: {versionInfo.latest}
          </div>
        </div>
      </Card>
    </div>
  );
}
