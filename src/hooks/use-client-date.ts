import { useEffect, useState } from "react";

/**
 * Custom hook to format dates safely on the client side
 * This prevents hydration mismatches between server and client
 */
export function useClientDate() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
    if (!isClient) return ""; // Return empty string during SSR
    
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("id-ID", options);
  };

  const formatTime = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
    if (!isClient) return ""; // Return empty string during SSR
    
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString("id-ID", options);
  };

  return { formatDate, formatTime, isClient };
} 