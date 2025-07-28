import { writable } from 'svelte/store';

// A map to store fetched SVG content: { 'icon-name': 'svg-string' }
const svgCache = new Map<string, string>();

// A writable store to manage the loading state
export const svgLoading = writable(new Set<string>());

// Fetches and caches SVG content.
export async function getSvgContent(iconName: string): Promise<string> {
  const src = `/src/lib/assets/icons/${iconName}.svg`;

  // Check cache first
  if (svgCache.has(iconName)) {
    return svgCache.get(iconName)!;
  }

  // Mark as loading
  svgLoading.update(loadingSet => {
    loadingSet.add(iconName);
    return loadingSet;
  });

  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
    }
    const svgText = await response.text();

    // Cache the content
    svgCache.set(iconName, svgText);
    return svgText;
  } catch (e) {
    console.error(`Error fetching SVG ${src}:`, e);
    // Fallback SVG for errors
    const fallbackSvg = `<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="red"/></svg>`;
    svgCache.set(iconName, fallbackSvg); // Cache fallback too to avoid repeated errors
    return fallbackSvg;
  } finally {
    // Mark as no longer loading
    svgLoading.update(loadingSet => {
      loadingSet.delete(iconName);
      return loadingSet;
    });
  }
}