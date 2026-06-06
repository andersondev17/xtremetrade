import {
  AlertCircle,
  Cpu,
  FileText,
  Upload
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { ChartAnalysisResult } from "../types";

interface VisualParserViewProps {
  isAnalyzing: boolean;
  analysisStatus: string;
  analyzedResult: ChartAnalysisResult | null;
  apiErrorMessage: string;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setAnalyzedResult: (result: ChartAnalysisResult | null) => void;
}

export default function VisualParserView({
  isAnalyzing,
  analysisStatus,
  analyzedResult,
  apiErrorMessage,
  dragActive,
  handleDrag,
  handleDrop,
  handleFileInput,
  setAnalyzedResult
}: VisualParserViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 font-sans select-none"
    >
      {/* Title Header */}
      <div className="pb-5 border-b border-gray-200/60">
        <h2 className="text-xl font-medium font-serif tracking-tight text-[#111827] flex items-center gap-2.5">
          <span className="p-1 px-1.5 rounded-lg bg-black text-[#ffffff]">
            <Upload className="w-5 h-5 text-emerald-400" />
          </span>
          AI Vision Chart Parser
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          Perform high-fidelity geometric candlestick analysis by uploading chart screenshots to evaluate prompt confidence patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left side: Upload Console (always beautifully sized) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Screenshot Dropzone
              </span>
              <span className="text-[9px] font-mono bg-gray-50 text-gray-500 px-2.5 py-0.5 rounded border border-gray-200">
                Gemini Multi-Modal
              </span>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`aspect-[4/3] w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative ${
                dragActive
                  ? "border-black bg-gray-50"
                  : isAnalyzing
                    ? "border-amber-400 bg-amber-50/20"
                    : "border-gray-200 hover:border-black hover:bg-gray-50/40"
              }`}
            >
              <input
                type="file"
                id="chart-upload-file-view"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <label
                htmlFor="chart-upload-file-view"
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer absolute inset-0 p-6"
              >
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto border border-amber-200">
                      <Cpu className="w-6 h-6 text-amber-500 animate-spin" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-gray-800 font-mono">
                        SCANNING CHART CANDLES...
                      </p>
                      <p className="text-[10px] text-amber-600 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-100 italic max-w-[210px] mx-auto truncate text-center">
                        {analysisStatus || "Initiating visual proxy..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto border border-gray-255/10 hover:scale-105 transition-all">
                      <Upload className="w-6 h-6 text-black" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-800">
                        Submit Trading Chart Screenshot
                      </p>
                      <p className="text-[10px] text-gray-400 leading-relaxed max-w-[220px] mx-auto">
                        Drag & drop your candlestick image here or click to browse.
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {apiErrorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed font-sans">{apiErrorMessage}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
