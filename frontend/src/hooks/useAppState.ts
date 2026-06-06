import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { TradeSignal, PerformanceStats, ChartAnalysisResult, AgentState } from "../types";
import { ApiService, CreateSignalInput } from "../services/api";
import { ChartUploadFacade } from "../lib/upload/facade";

export function useAppState() {
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [stats, setStats] = useState<PerformanceStats>({
    winRate: 75,
    totalSignals: 35,
    completedSignals: 18,
    totalPnl: 48.24,
    accuracyHistory: [],
    pnlHistory: [],
  });
  const [agentState, setAgentState] = useState<AgentState>({
    riskProfile: "CONSERVATIVE",
    executionMode: "ASSISTED",
    minCapitalLimit: 5000,
    currentBalance: 12500,
    startingBalance: 10000,
    isOperating: true,
    consecutiveLosses: 0,
    opportunities: [],
    logs: [],
    investmentProfile: "CONSERVATIVE",
    investmentPercentage: 50,
    maxAvailablePositions: 4,
    swapSuggestions: [],
    stopLossAlerts: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [analyzedResult, setAnalyzedResult] = useState<ChartAnalysisResult | null>(null);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [currentView, setCurrentView] = useState<"FEED" | "ANALYTICS" | "HISTORY" | "AGENT" | "CALIBRATION" | "PARSER">("AGENT");

  const uploadFacade = useMemo(() => new ChartUploadFacade(), []);

  const refreshAllData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [signalsData, statsData, agentStateData] = await Promise.all([
        ApiService.fetchSignals(),
        ApiService.fetchStats(),
        ApiService.fetchAgentState(),
      ]);

      setSignals((prev) => {
        if (signalsData.length > 0) {
          const newest = signalsData[0];
          const timeSinceMsg = Date.now() - newest.timestamp;
          if (timeSinceMsg < 12000 && signalsData.length > prev.length && prev.length > 0) {
            toast.success(`New block verified: ${newest.token} (${newest.signal})`, {
              description: `Entry: $${newest.price} | accuracy: ${Math.round(newest.confidence * 100)}%`,
            });
          }
        }
        return signalsData;
      });

      setStats(statsData);
      setAgentState(agentStateData);
    } catch (err: any) {
      console.error("Aggregation sync failure:", err);
      if (!silent) toast.error(err.message || "Failed to synchronize ledger feeds.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(() => refreshAllData(true), 12000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  const handleCreateCustomSignal = useCallback(async (customSignal: CreateSignalInput) => {
    try {
      const signal = await ApiService.createSignal(customSignal);
      toast.success(`Operator Signal registered for ${signal.token}`, {
        description: `Recommendation: ${signal.signal}`,
      });
      await refreshAllData(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to register custom operator signal.");
    }
  }, [refreshAllData]);

  const handleConfigureAgent = useCallback(
    async (params: Parameters<typeof ApiService.configureAgent>[0]) => {
      try {
        const updated = await ApiService.configureAgent(params);
        setAgentState(updated);
        toast.success("Agent parameters calibrated successfully.");
      } catch (err: any) {
        toast.error(err.message || "Failed to update agent configuration.");
      }
    }, []);

  const handleApproveOpportunity = useCallback(async (opportunityId: string) => {
    try {
      const updated = await ApiService.approveOpportunity(opportunityId);
      setAgentState(updated);
      toast.success("Opportunity approved! Position opened.");
      await refreshAllData(true);
    } catch (err: any) {
      toast.error(err.message || "Action blocked by active risk rules.");
    }
  }, [refreshAllData]);

  const handleRejectOpportunity = useCallback(async (opportunityId: string) => {
    try {
      const updated = await ApiService.rejectOpportunity(opportunityId);
      setAgentState(updated);
      toast.info("Scanned opportunity dismissed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to dismiss opportunity.");
    }
  }, []);

  const handleApproveSwap = useCallback(async (swapId: string) => {
    try {
      const updated = await ApiService.approveSwap(swapId);
      setAgentState(updated);
      toast.success("Stop-Loss alert accepted. Position closed, capital recovered.");
      await refreshAllData(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to accept stop-loss alert.");
    }
  }, [refreshAllData]);

  const handleRejectSwap = useCallback(async (swapId: string) => {
    try {
      const updated = await ApiService.rejectSwap(swapId);
      setAgentState(updated);
      toast.info("Stop-Loss alert rejected. Continuing to hold position.");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject stop-loss alert.");
    }
  }, []);

  const handleCloseSignalEarly = useCallback(async (signalId: string) => {
    try {
      const updated = await ApiService.closeSignalEarly(signalId);
      setAgentState(updated);
      toast.success("Early exit triggered! Capital refunded.");
      await refreshAllData(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to close signal early.");
    }
  }, [refreshAllData]);

  const handleResetAgent = useCallback(async () => {
    try {
      const updated = await ApiService.resetAgent();
      setAgentState(updated);
      toast.success("Agent state re-initialized successfully.");
      await refreshAllData(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset agent.");
    }
  }, [refreshAllData]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;
    setIsAnalyzing(true);
    setApiErrorMessage("");
    setAnalyzedResult(null);
    try {
      toast.info("Image uploaded. Analyzing chart candles...", { duration: 3000 });
      const response = await uploadFacade.uploadAndAnalyze(file, (progress) => {
        setAnalysisStatus(progress.status);
      });
      setAnalyzedResult(response.analysis);
      toast.success(`Scan verdict: ${response.analysis.pattern}`, {
        description: `${response.analysis.signal} on ${response.analysis.token}/USDC — ${Math.round(response.analysis.confidence * 100)}% confidence.`,
      });
      await refreshAllData(true);
    } catch (err: any) {
      const errMsg = err.message || "Connection failure with AI Vision model endpoint.";
      setApiErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus("");
    }
  }, [refreshAllData, uploadFacade]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0]);
  }, [handleImageUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
  }, [handleImageUpload]);

  return {
    signals,
    stats,
    agentState,
    isLoading,
    isAnalyzing,
    analysisStatus,
    analyzedResult,
    apiErrorMessage,
    dragActive,
    currentView,
    setCurrentView,
    setAnalyzedResult,
    refreshAllData: () => refreshAllData(false),
    handleCreateCustomSignal,
    handleDrag,
    handleDrop,
    handleFileInput,
    handleConfigureAgent,
    handleApproveOpportunity,
    handleRejectOpportunity,
    handleApproveSwap,
    handleRejectSwap,
    handleCloseSignalEarly,
    handleResetAgent,
  };
}
