import { ApiService, AnalyzeChartResponse } from "../../services/api";
import { FileValidationEngine } from "./validation";

export interface UploadProgressDetails {
  status: string;
  isCompleted: boolean;
}

export type ProgressCallback = (details: UploadProgressDetails) => void;

/**
 * FACADE PATTERN: CHART UPLOAD & AI VERIFICATION FLOW
 * Coordinates file validation strategy checks, streaming file reader base64 strings,
 * dispatching timed micro-status indicators, and invoking server endpoints.
 */
export class ChartUploadFacade {
  private validationEngine: FileValidationEngine;

  constructor() {
    this.validationEngine = new FileValidationEngine();
  }

  /**
   * Coordinates the verification lifecycle
   */
  async uploadAndAnalyze(
    file: File,
    onProgress: ProgressCallback
  ): Promise<AnalyzeChartResponse> {
    // 1. Perform Strategy-based validation check
    const validation = this.validationEngine.validate(file);
    if (!validation.isValid) {
      throw new Error(validation.error || "File validation check failed");
    }

    onProgress({ status: "Preparing technical chart upload...", isCompleted: false });

    // 2. Wrap FileReader stream as a promise
    const base64Data = await this.readAsBase64(file);

    // 3. Setup timed incremental status indicator loops
    const progressTicks = [
      "Analyzing chart visual metrics...",
      "Executing multimodal canvas scan...",
      "Parsing candle support clusters...",
      "Matching trend-line regressions...",
      "Checking Monad devnet pool depths..."
    ];

    let currentTick = 0;
    onProgress({ status: progressTicks[0], isCompleted: false });

    const intervalId = setInterval(() => {
      currentTick++;
      if (currentTick < progressTicks.length) {
        onProgress({ status: progressTicks[currentTick], isCompleted: false });
      }
    }, 1200);

    try {
      // 4. Submit to infrastructure endpoint
      const result = await ApiService.analyzeChart({
        imageBase64: base64Data,
        filename: file.name,
      });

      onProgress({ status: "Matched successfully!", isCompleted: true });
      return result;
    } finally {
      clearInterval(intervalId);
    }
  }

  /**
   * Helper to convert file blobs to base64 data URIs
   */
  private readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("File conversion stream typed error"));
        }
      };
      reader.onerror = () => reject(new Error("Failure to stream local chart image data"));
    });
  }
}
