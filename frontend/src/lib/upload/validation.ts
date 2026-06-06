/**
 * STRATEGY PATTERN: FILE VALIDATION
 * Isolates and encapsulates validation strategies. 
 * Allows new strategies (e.g. CSV analysis, PDF analysis) to be added 
 * without modifying existing file upload flow orchestration.
 */

export interface ValidationContext {
  file: File;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationStrategy {
  name: string;
  validate(context: ValidationContext): ValidationResult;
}

/**
 * Validates files based on total binary sizing (Max 10MB)
 */
export class FileSizeValidationStrategy implements FileValidationStrategy {
  name = "FileSize";
  private maxBytes: number;

  constructor(maxBytes = 10 * 1024 * 1024) { // Default 10MB limit
    this.maxBytes = maxBytes;
  }

  validate({ file }: ValidationContext): ValidationResult {
    if (file.size > this.maxBytes) {
      const sizeMb = (this.maxBytes / (1024 * 1024)).toFixed(0);
      return {
        isValid: false,
        error: `Chart payload exceeds maximum allowance of ${sizeMb}MB.`,
      };
    }
    return { isValid: true };
  }
}

/**
 * Validates files based on allowable image mimtypes
 */
export class MimeTypeValidationStrategy implements FileValidationStrategy {
  name = "MimeType";
  private allowedTypes: string[];

  constructor(allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]) {
    this.allowedTypes = allowedTypes;
  }

  validate({ file }: ValidationContext): ValidationResult {
    if (!this.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Asset is not a valid technical diagram image. Acceptable types: ${this.allowedTypes
          .map((t) => t.replace("image/", "").toUpperCase())
          .join(", ")}`,
      };
    }
    return { isValid: true };
  }
}

/**
 * Strategy Manager orchestrates execution of multiple concurrent checks.
 */
export class FileValidationEngine {
  private strategies: FileValidationStrategy[] = [];

  constructor() {
    this.strategies = [
      new FileSizeValidationStrategy(),
      new MimeTypeValidationStrategy(),
    ];
  }

  /**
   * Adds custom verification strategies at runtime
   */
  registerStrategy(strategy: FileValidationStrategy) {
    this.strategies.push(strategy);
  }

  /**
   * Evaluates all strategies sequentially. Fails fast.
   */
  validate(file: File): ValidationResult {
    const context: ValidationContext = { file };
    for (const strategy of this.strategies) {
      const result = strategy.validate(context);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  }
}
