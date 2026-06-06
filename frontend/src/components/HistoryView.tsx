import React, { useMemo } from "react";
import { TradeSignal } from "../types";
import DataTable, { ColumnDefinition } from "./DataTable";

// Define static column strategies with responsive styling and premium designs
const COLUMNS: ColumnDefinition<TradeSignal>[] = [
  {
    key: "token",
    header: "Target pair",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-3 select-none">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">
          {item.token.substring(0, 2)}
        </div>
        <div>
          <span className="font-bold text-[#1F2937] block leading-tight">
            {item.token}/USDC
          </span>
          <a
            href={`https://monadvision.xyz/tx/${item.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-[9px] text-[#9CA3AF] hover:text-[#1F2937] font-mono block hover:underline transition-colors mt-0.5"
            title="Verify on MonadVision"
          >
            Tx: {item.txHash.substring(0, 10)}... ↗
          </a>
        </div>
      </div>
    ),
  },
  {
    key: "signal",
    header: "Directive Type",
    sortable: true,
    render: (item) => (
      <span
        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border inline-block select-none ${
          item.signal === "BUY"
            ? "bg-emerald-500/10 text-emerald-650 border-emerald-500/20"
            : "bg-rose-500/10 text-rose-650 border-rose-500/20"
        }`}
      >
        {item.signal}
      </span>
    ),
  },
  {
    key: "pattern",
    header: "Detected Pattern",
    sortable: true,
    className: "text-[#4B5563] text-xs font-sans",
  },
  {
    key: "pnl",
    header: "Captured Yield",
    sortable: true,
    headerClassName: "text-right justify-end",
    className: "text-right",
    render: (item) => (
      <span
        className={`font-mono font-bold text-sm select-none ${
          item.result === "PROFIT" || (item.pnl && item.pnl > 0)
            ? "text-emerald-500"
            : "text-rose-500"
        }`}
      >
        {item.pnl ? `${item.pnl > 0 ? "+" : ""}${item.pnl}%` : "No PnL"}
      </span>
    ),
  },
  {
    key: "timestamp",
    header: "Epoch Verified",
    sortable: true,
    headerClassName: "text-right justify-end",
    className: "text-right text-[#9CA3AF] text-xs font-mono",
    render: (item) => {
      const dateObj = new Date(item.timestamp);
      return (
        <span className="select-none">
          {dateObj.toLocaleDateString()}{" "}
          {dateObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </span>
      );
    },
  }
];

interface HistoryViewProps {
  signals: TradeSignal[];
}

/**
 * ARCHIVED SIGNAL LEDGER VIEW
 * Presentational layer consuming the generic Column Strategy DataTable.
 * This decouples raw table parsing, layout rendering, and lists sorting logic completely.
 */
export default function HistoryView({ signals }: HistoryViewProps) {
  const completedSignals = useMemo(() => {
    return signals.filter((s) => s.status === "COMPLETED");
  }, [signals]);

  return (
    <div
      id="history-view-tab"
      className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/55 shadow-sm space-y-6"
    >
      <div>
        <h2 className="text-xl font-serif font-semibold text-text-primary">
          Archived Closed Signals Trade Ledger
        </h2>
        <p className="text-text-secondary text-xs mt-1">
          Historically completed trade actions matched on decentralized liquidity exchanges and verified.
        </p>
      </div>

      <DataTable
        data={completedSignals}
        columns={COLUMNS}
        rowKey={(item) => item.id}
        initialSortKey="timestamp"
        initialSortDirection="desc"
        pageSize={5} // High density compact sizing
      />
    </div>
  );
}
