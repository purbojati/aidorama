"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeColor() {
	const { theme, systemTheme } = useTheme();

	useEffect(() => {
		// Determine the actual theme (resolve "system" to actual theme)
		const resolvedTheme = theme === "system" ? systemTheme : theme;

		// Define theme colors based on your CSS custom properties
		const themeColors = {
			light: "#fbfafd", // Light background color (converted from oklch(0.9754 0.0084 325.6414))
			dark: "#1a0e1c", // Dark background color (converted from oklch(0.2409 0.0201 307.5346))
		};

		// Get the appropriate color
		const themeColor = themeColors[resolvedTheme as keyof typeof themeColors] || themeColors.light;

		// Update or create the theme-color meta tag
		let metaThemeColor = document.querySelector('meta[name="theme-color"]');
		
		if (!metaThemeColor) {
			metaThemeColor = document.createElement("meta");
			metaThemeColor.setAttribute("name", "theme-color");
			document.head.appendChild(metaThemeColor);
		}

		metaThemeColor.setAttribute("content", themeColor);
	}, [theme, systemTheme]);

	return null;
} 