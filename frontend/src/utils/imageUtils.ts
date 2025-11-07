/**
 * Image utility functions for handling various image formats
 * including base64, data URLs, blob URLs, and external URLs
 */

import { useEffect, useState } from 'react';

/**
 * Normalize image strings to proper data URLs
 * Handles:
 * - Data URLs (with or without malformed spacing)
 * - Blob URLs (pass through)
 * - HTTP/HTTPS URLs (pass through)
 * - Raw Base64 strings
 *
 * @param img - Image string in various formats
 * @returns Normalized data URL or original URL
 */
export const normalizeToDataUrl = (img: string): string => {
  // Already a blob or http URL - return as is
  if (img.startsWith('blob:') || img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }

  // Fix malformed data URLs with space before "base64"
  if (img.startsWith('data:')) {
    // Fix "; base64," to ";base64,"
    return img.replace(/;\s*base64,/, ';base64,');
  }

  // Raw Base64 string - wrap it in data URL format
  // Detect if it's a valid base64 string (alphanumeric + / + = characters)
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(img.substring(0, 100))) {
    return `data:image/jpeg;base64,${img}`;
  }

  // Default: return as-is (might be an external URL or invalid)
  return img;
};

/**
 * Convert Base64 string to Blob URL for better performance with large images
 * This is especially useful for displaying multiple large base64 images
 *
 * @param base64String - Base64 encoded image string
 * @returns Blob URL or null if conversion fails
 */
export const base64ToBlobUrl = (base64String: string): string | null => {
  try {
    // Normalize first
    const dataUrl = normalizeToDataUrl(base64String);

    // Skip if it's already a blob or http URL
    if (dataUrl.startsWith('blob:') || dataUrl.startsWith('http')) {
      return null;
    }

    // Extract base64 data and MIME type
    if (!dataUrl.startsWith('data:')) {
      return null;
    }

    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return null;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Convert to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to convert base64 to blob:', error);
    return null;
  }
};

/**
 * Get display URL for an image with caching support
 * Priority order:
 * 1. Use existing blob URL from cache
 * 2. Try to convert to blob URL for better performance
 * 3. Fallback to normalized data URL
 *
 * @param img - Image string
 * @param cache - Optional Map to cache blob URLs
 * @returns Display URL for the image
 */
export const getDisplayUrl = (
  img: string,
  cache?: Map<string, string>
): string => {
  // Check cache first
  if (cache) {
    const cachedUrl = cache.get(img);
    if (cachedUrl) {
      return cachedUrl;
    }
  }

  // Try to create blob URL for large base64 strings
  const blobUrl = base64ToBlobUrl(img);
  if (blobUrl) {
    // Cache if available
    if (cache) {
      cache.set(img, blobUrl);
    }
    return blobUrl;
  }

  // Fallback to normalized data URL
  return normalizeToDataUrl(img);
};

/**
 * Cleanup blob URLs to prevent memory leaks
 * Call this when component unmounts or when blob URLs are no longer needed
 *
 * @param cache - Map of cached blob URLs
 */
export const cleanupBlobUrls = (cache: Map<string, string>): void => {
  cache.forEach((blobUrl) => {
    if (blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }
  });
  cache.clear();
};

/**
 * Convert array of images to blob URLs with caching
 * Skips already converted images and HTTP/HTTPS URLs
 *
 * @param images - Array of image strings (base64 or data URLs)
 * @param cache - Cache map to store and retrieve blob URLs
 * @returns Updated cache map
 */
export const convertImagesToBlobs = (
  images: string[],
  cache: Map<string, string>
): Map<string, string> => {
  const newCache = new Map(cache);

  for (const imageStr of images) {
    // Skip if already in cache
    if (newCache.has(imageStr)) {
      continue;
    }

    // Skip HTTP/HTTPS URLs and existing blob URLs
    if (imageStr.startsWith('http') || imageStr.startsWith('blob:')) {
      continue;
    }

    // Try to convert to blob URL
    const blobUrl = base64ToBlobUrl(imageStr);
    if (blobUrl) {
      newCache.set(imageStr, blobUrl);
    }
  }

  return newCache;
};

/**
 * React Hook: Automatically converts images to blob URLs and cleans up on unmount
 * Usage: const imageBlobUrls = useImageBlobUrls(images);
 *
 * @param images - Array of image strings to convert
 * @returns Map of original image strings to blob URLs
 */
export const useImageBlobUrls = (images: string[]): Map<string, string> => {
  const [blobUrls, setBlobUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Convert images to blobs
    const newBlobUrls = convertImagesToBlobs(images, blobUrls);

    // Only update state if there are new conversions
    if (newBlobUrls.size !== blobUrls.size) {
      setBlobUrls(newBlobUrls);
    }

    // Cleanup on unmount
    return () => {
      cleanupBlobUrls(blobUrls);
    };
  }, [images]);

  return blobUrls;
};

/**
 * Get the best display URL for an image
 * Checks blob cache first, then normalizes the image string
 *
 * @param img - Image string
 * @param blobCache - Optional blob URL cache
 * @returns Best URL for displaying the image
 */
export const getImageDisplayUrl = (
  img: string,
  blobCache?: Map<string, string>
): string => {
  // Check blob cache first
  if (blobCache && blobCache.has(img)) {
    return blobCache.get(img)!;
  }

  // Fallback to normalized data URL
  return normalizeToDataUrl(img);
};
