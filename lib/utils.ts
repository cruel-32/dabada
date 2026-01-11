import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeUrl(url: string, platform: string): string {
  try {
    if (platform === 'youtube') {
      // Extract Video ID
      // Patterns: 
      // youtube.com/watch?v=VIDEO_ID
      // youtu.be/VIDEO_ID
      // youtube.com/shorts/VIDEO_ID
      const urlObj = new URL(url);
      let videoId = '';
      
      if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.pathname.includes('/shorts/')) {
          videoId = urlObj.pathname.split('/shorts/')[1].split('?')[0];
        } else {
          videoId = urlObj.searchParams.get('v') || '';
        }
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      }

      if (videoId) {
        return `youtube:${videoId}`;
      }
    } else if (platform === 'instagram') {
      // Extract Shortcode
      // instagram.com/p/SHORTCODE/
      // instagram.com/reel/SHORTCODE/
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0);
      
      // Usually /p/SHORTCODE or /reel/SHORTCODE
      if (pathParts.length >= 2 && (pathParts[0] === 'p' || pathParts[0] === 'reel' || pathParts[0] === 'reels')) {
        return `instagram:${pathParts[1]}`;
      }
    }
  } catch (e) {
    // URL parsing failed, fall back to raw URL cleaned up
    console.error("URL normalization failed:", e);
  }

  // Fallback: remove query params and trailing slash
  return url.split('?')[0].replace(/\/$/, '');
}
