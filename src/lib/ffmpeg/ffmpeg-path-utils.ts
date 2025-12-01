/**
 * FFmpeg Path Utilities
 *
 * Utilities for handling file paths in FFmpeg commands, including escaping
 * for the subtitles filter and validation for safe processing.
 */

/**
 * FFmpeg Subtitle Filter Path Escaping
 * =====================================
 *
 * The subtitles filter in FFmpeg requires careful path escaping due to
 * multiple parsing layers:
 *
 * Layer 1: FFmpeg option parser
 *   -vf "subtitles='C:\\path\\file.ass'"
 *   The outer quotes protect the entire filter string
 *
 * Layer 2: Filter graph parser
 *   Parses: subtitles='C:\\path\\file.ass'
 *   Special chars: [ ] ; , = ' need escaping with backslash
 *
 * Layer 3: Subtitles filter (libass)
 *   Receives: C:\path\file.ass (after unescaping)
 *   On Windows, backslashes are path separators
 *
 * Escaping chain for backslash on Windows:
 *   Original file:     C:\path\file.ass
 *   In JS string:      "C:\\path\\file.ass" (2 backslashes)
 *   Escaped for FFmpeg: "C\\\\:\\\\path\\\\file.ass" (4 backslashes)
 *   After filter parse: C\\path\\file.ass (2 backslashes)
 *   After libass parse: C:\path\file.ass (1 backslash - correct!)
 */

/**
 * Escapes a file path for use in FFmpeg's subtitles filter.
 *
 * @param filePath - The absolute path to the subtitle file
 * @returns Escaped path safe for use in subtitles filter
 *
 * @example
 * escapeSubtitlePath("C:\\Users\\test\\subtitles.ass")
 * // Returns: "C\\\\:\\\\Users\\\\test\\\\subtitles.ass"
 */
export function escapeSubtitlePath(filePath: string): string {
  return (
    filePath
      // Step 1: Escape backslashes first (must be done before other escapes)
      // Windows paths need 4 backslashes due to double unescaping by FFmpeg + libass
      .replace(/\\/g, "\\\\\\\\")
      // Step 2: Escape colons (Windows drive letters like C:)
      .replace(/:/g, "\\:")
      // Step 3: Escape single quotes (string delimiters)
      .replace(/'/g, "\\'")
      // Step 4: Escape filter graph special characters
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/=/g, "\\=")
  );
}

/**
 * Validates that a path is safe for FFmpeg processing.
 *
 * @param filePath - Path to validate
 * @returns Object with isValid flag and optional error message
 *
 * @example
 * validatePathForFFmpeg("C:\\Users\\test.ass")
 * // Returns: { isValid: true }
 *
 * validatePathForFFmpeg("C:\\Users\\test\ninjection.ass")
 * // Returns: { isValid: false, error: "Path contains newline characters" }
 */
export function validatePathForFFmpeg(filePath: string): {
  isValid: boolean;
  error?: string;
} {
  // Check for newlines (could break command)
  if (filePath.includes("\n") || filePath.includes("\r")) {
    return { isValid: false, error: "Path contains newline characters" };
  }

  // Check for null bytes
  if (filePath.includes("\0")) {
    return { isValid: false, error: "Path contains null bytes" };
  }

  // Check path length (Windows MAX_PATH = 260, but can be longer with \\?\ prefix)
  if (filePath.length > 32767) {
    return { isValid: false, error: "Path exceeds maximum length" };
  }

  // Check for problematic Unicode characters
  // Some Unicode characters are invisible or could cause parsing issues
  const hasProblematicUnicode = /[\u200B-\u200F\u2028-\u202F\uFEFF]/.test(filePath);
  if (hasProblematicUnicode) {
    return {
      isValid: false,
      error: "Path contains invisible Unicode characters",
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes a filename by removing or replacing unsafe characters.
 *
 * @param filename - The filename to sanitize
 * @returns Safe filename for filesystem use
 */
export function sanitizeFileName(filename: string): string {
  return filename
    // Remove/replace characters that are problematic on Windows/Unix
    .replace(/[<>:"/\\|?*]/g, "_")
    // Remove control characters
    .replace(/[\x00-\x1f\x7f]/g, "")
    // Trim whitespace and dots from start/end
    .replace(/^[\s.]+|[\s.]+$/g, "")
    // Limit length
    .slice(0, 200);
}
