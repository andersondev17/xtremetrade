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

        {/* Right side: Results Showcase (beautiful layout filling remaining space) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {analyzedResult ? (
              <motion.div
                key="result-filled"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      AI Multimodal Analytical Verdict
                    </span>
                    <h3 className="text-xl font-serif font-semibold text-gray-900 mt-2">
                      Pattern Match: {analyzedResult.pattern}
                    </h3>
                  </div>
                  <button
                    onClick={() => setAnalyzedResult(null)}
                    className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-500 hover:text-black font-semibold rounded-lg font-mono cursor-pointer"
                  >
                    Clear Results
                  </button>
                </div>

                {/* Grid metrics cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                    <span className="text-[9px] text-[#9CA3AF] uppercase block font-semibold">Matched Pool</span>
                    <span className="text-sm font-bold text-gray-800 block mt-1">{analyzedResult.token}/USDC</span>
                    <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Confidence: {Math.round(analyzedResult.confidence * 100)}%</span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                    <span className="text-[9px] text-[#9CA3AF] uppercase block font-semibold">Target Action</span>
                    <span className={`text-sm font-bold block mt-1 ${
                      analyzedResult.signal === "BUY" ? "text-emerald-600" : "text-rose-600"
                    }`}>{analyzedResult.signal}</span>
                    <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Timeframe: {analyzedResult.timeframe}</span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2 md:col-span-1 font-mono">
                    <span className="text-[9px] text-[#9CA3AF] uppercase block font-semibold">Candlestick Entry</span>
                    <span className="text-sm font-bold text-gray-800 block mt-1">${analyzedResult.price}</span>
                    <span className="text-[9px] text-gray-450 block mt-0.5">Target: ${analyzedResult.targetPrice}</span>
                  </div>
                </div>

                {/* Sub limits display */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 font-mono text-center text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-600 block">Take Profit Trigger Limit</span>
                    <span className="font-bold text-emerald-600 font-mono text-sm block mt-0.5">${analyzedResult.targetPrice}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-rose-500 block">Stop Loss Trigger Limit</span>
                    <span className="font-bold text-rose-500 font-mono text-sm block mt-0.5">${analyzedResult.stopLoss}</span>
                  </div>
                </div>

                {/* Explanation text block */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-gray-400 font-bold block">
                    Detailed AI Grounding Breakdown
                  </span>
                  <p className="text-xs text-gray-650 leading-relaxed font-sans">
                    {analyzedResult.explanation}
                  </p>
                </div>

                {/* Indicators metadata chips */}
                {analyzedResult.indicators && analyzedResult.indicators.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {analyzedResult.indicators.map((ind, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded text-gray-600 font-semibold"
                      >
                        🏷️ {ind}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#FFFFFF]/50 p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center justify-center min-h-[300px] text-gray-400"
              >
                <FileText className="w-10 h-10 text-gray-300 mb-3" />
                <h4 className="font-serif text-sm font-medium text-gray-700">No Verdict Results Loaded</h4>
                <p className="text-xs max-w-sm mt-1.5 leading-relaxed">
                  Submit a candlestick trade image on the left. The Multimodal Vision Engine will analyze price actions, patterns, and indicators to draft matching trade recommendations.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
