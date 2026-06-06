import { ArrowLeft, Bot, Cpu, History, Home, LineChart, Menu, PanelLeft, PanelLeftClose, RefreshCw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { playClickSound } from "../lib/audio";

interface SidebarProps {
  currentView: "FEED" | "ANALYTICS" | "HISTORY" | "AGENT";
  setCurrentView: (view: "FEED" | "ANALYTICS" | "HISTORY" | "AGENT") => void;
  activeSignalsCount: number;
  completedSignalsCount: number;
  winRate: number;
  currentBlock: number;
  onRefresh: () => void;
  agentIsOperating: boolean;
  onBackToLanding?: () => void;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  activeSignalsCount,
  completedSignalsCount,
  winRate,
  currentBlock,
  onRefresh,
  agentIsOperating,
  onBackToLanding
 }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("signalai_sidebar_collapsed");
      return saved === "true";
    } catch (e) {
      return false;
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keyboard shortcut loader: Ctrl+B or Cmd+B to toggle sidebar collapsible state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isB = e.key.toLowerCase() === "b";
      const isControl = e.ctrlKey || e.metaKey;
      if (isControl && isB) {
        e.preventDefault();
        setIsCollapsed((prev) => {
          const next = !prev;
          try {
            localStorage.setItem("signalai_sidebar_collapsed", String(next));
          } catch (err) {}
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCollapse = () => {
    playClickSound();
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("signalai_sidebar_collapsed", String(next));
      } catch (err) {}
      return next;
    });
  };

  const handleMobileNav = (view: "FEED" | "ANALYTICS" | "HISTORY" | "AGENT") => {
    playClickSound();
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleDesktopNav = (view: "FEED" | "ANALYTICS" | "HISTORY" | "AGENT") => {
    playClickSound();
    setCurrentView(view);
  };

  const triggerRefresh = () => {
    playClickSound();
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleBackToLanding = () => {
    playClickSound();
    if (onBackToLanding) {
      onBackToLanding();
    }
  };

  const tooltipClass = "absolute left-full ml-3 px-2.5 py-1 bg-[#111827] text-white text-[10px] font-mono rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-[99] whitespace-nowrap border border-gray-800/20";

  return (
    <>
      {/* NAVEGACIÓN MÓVIL SUPERIOR */}
      <header className="lg:hidden h-16 w-full bg-[#FFFFFF] border-b border-gray-200/80 px-6 flex items-center justify-between sticky top-0 z-40 select-none font-sans">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-mono font-bold tracking-tighter shadow-sm">
            S
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-[#1F2937] block">Xtreme Trade</span>
            <span className="text-[8px] block text-[#9CA3AF] uppercase tracking-widest font-mono font-medium -mt-1.5">Red Monad</span>
          </div>
        </div>

        <button 
          onClick={() => { playClickSound(); setIsMobileMenuOpen(true); }}
          className="p-2 border border-gray-200 rounded-lg text-[#1F2937] hover:bg-gray-50 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* MENÚ MÓVIL LATERAL */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden font-sans">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { playClickSound(); setIsMobileMenuOpen(false); }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Contenedor del Menú */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-white shadow-2xl p-6 flex flex-col justify-between z-10"
            >
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-mono font-bold tracking-tighter shadow-sm">
                      S
                    </div>
                    <div>
                      <span className="font-bold text-base tracking-tight text-[#1F2937] block">Xtreme Trade</span>
                      <span className="text-[8px] block text-[#9CA3AF] uppercase tracking-widest font-mono font-medium -mt-1">Red Monad</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { playClickSound(); setIsMobileMenuOpen(false); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-2 font-sans">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-3 px-1">Centro de Navegación</div>
                  
                  <button 
                    onClick={() => handleMobileNav("AGENT")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wide font-medium transition-all cursor-pointer ${
                      currentView === "AGENT" 
                        ? "bg-[#111827] text-white shadow-sm font-semibold" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Bot className="w-4 h-4 text-emerald-500" />
                    <span>Agente Autónomo</span>
                    {agentIsOperating ? (
                      <span className="ml-auto bg-emerald-500/10 text-emerald-600 text-[9px] px-2 py-0.5 rounded-full font-sans font-bold leading-none animate-pulse">
                        ACTIVO
                      </span>
                    ) : (
                      <span className="ml-auto bg-gray-100 text-gray-400 text-[9px] px-2 py-0.5 rounded-full font-sans font-medium leading-none">
                        PAUSADO
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => handleMobileNav("FEED")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wide font-medium transition-all cursor-pointer ${
                      currentView === "FEED" 
                        ? "bg-[#111827] text-white shadow-sm font-semibold" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                    <span>Flujo en Vivo</span>
                    {activeSignalsCount > 0 && (
                      <span className="ml-auto bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-sans font-bold leading-none animate-pulse">
                        {activeSignalsCount} ACTIVO
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => handleMobileNav("ANALYTICS")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wide font-medium transition-all cursor-pointer ${
                      currentView === "ANALYTICS" 
                        ? "bg-[#111827] text-white shadow-sm font-semibold" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <LineChart className="w-4 h-4" />
                    <span>Rendimiento</span>
                    <span className="ml-auto text-[9px] font-mono text-[#10b981] bg-[#DCFCE7] px-2 py-0.5 rounded border border-emerald-100">
                      {winRate}%
                    </span>
                  </button>

                  <button 
                    onClick={() => handleMobileNav("HISTORY")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wide font-medium transition-all cursor-pointer ${
                      currentView === "HISTORY" 
                        ? "bg-[#111827] text-white shadow-sm font-semibold" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <History className="w-4 h-4 text-gray-500" />
                    <span>Registros Guardados</span>
                    <span className="ml-auto text-[10px] text-gray-400 font-mono">
                      {completedSignalsCount}
                    </span>
                  </button>

                  {onBackToLanding && (
                    <button 
                      onClick={handleBackToLanding}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wide font-medium text-text-secondary hover:text-black hover:bg-gray-50 transition-all cursor-pointer border-t border-gray-100 pt-3"
                    >
                      <ArrowLeft className="w-4 h-4 text-text-tertiary" />
                      <span>Volver al Inicio</span>
                    </button>
                  )}
                </nav>
              </div>

              {/* Detalles inferiores */}
              <div className="space-y-4 pt-6 border-t border-gray-150">
                <div className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-200/60 font-mono text-[10px] text-gray-500 space-y-1.5">
                  <div className="flex justify-between items-center pb-1.5 border-b border-gray-150">
                    <span className="text-gray-400">Host de Red</span>
                    <span className="text-gray-700 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500 animate-pulse"></span>
                      0xMON
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Bloque Sinc</span>
                    <span className="text-gray-900 font-bold">#{currentBlock.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={triggerRefresh}
                  className="w-full bg-black hover:bg-black/95 text-white py-2.5 px-3 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sincronizar Ledger</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPONENTES DE ESCRITORIO */}
      <aside 
        id="custom-apple-sidebar-desktop"
        className={`hidden lg:flex flex-col justify-between shrink-0 bg-[#FFFFFF] border-r border-gray-200/80 sticky top-0 h-screen select-none z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20 p-4" : "w-72 p-6"
        }`}
      >
        <div className="space-y-8 font-sans">
          {/* Logo Brand */}
          <div>
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-5">
                <div 
                  className="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-white font-mono font-bold tracking-tighter shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  onClick={toggleCollapse}
                  title="Expandir Panel (Ctrl+B)"
                >
                  S
                </div>
                <button 
                  onClick={toggleCollapse}
                  className="text-gray-400 hover:text-black p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                  title="Expandir Navegación (Ctrl+B)"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-white font-mono font-bold tracking-tighter shadow-sm">
                    S
                  </div>
                  <div>
                    <span className="font-bold text-lg tracking-tight text-[#1F2937] block">Xtreme Trade</span>
                    <span className="text-[10px] block text-[#9CA3AF] uppercase tracking-widest font-mono font-medium -mt-1.5">Red Monad</span>
                  </div>
                </div>
                <button 
                  onClick={toggleCollapse}
                  className="text-gray-400 hover:text-black p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Colapsar Navegación (Ctrl+B)"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Menú de Escritorio */}
          <nav className="space-y-1.5 font-sans">
            {!isCollapsed && (
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-2.5 px-1 block animate-fade-in">
                Panel de Control
              </div>
            )}
            
            {/* Agente Autónomo */}
            <button 
              onClick={() => handleDesktopNav("AGENT")}
              className={`w-full flex items-center rounded-xl text-xs font-mono tracking-wide font-medium transition-all group relative cursor-pointer ${
                isCollapsed ? "justify-center p-3" : "px-3.5 py-2.5 gap-3"
              } ${
                currentView === "AGENT" 
                  ? "bg-[#111827] text-white shadow-sm font-semibold" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Bot className={`w-4 h-4 shrink-0 ${agentIsOperating ? "text-emerald-500 animate-pulse" : "text-gray-400"}`} />
              {!isCollapsed && (
                <>
                  <span>Agente Autónomo</span>
                  {agentIsOperating ? (
                    <span className="ml-auto text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded font-bold font-mono">
                      ACTIVO
                    </span>
                  ) : (
                    <span className="ml-auto text-[9px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded font-normal font-mono">
                      PAUSADO
                    </span>
                  )}
                </>
              )}
              {isCollapsed && (
                <div className={tooltipClass}>
                  Agente Autónomo {agentIsOperating ? "(Autopiloto Activo)" : "(Pausado)"}
                </div>
              )}
            </button>

            {/* Flujo en Vivo */}
            <button 
              onClick={() => handleDesktopNav("FEED")}
              className={`w-full flex items-center rounded-xl text-xs font-mono tracking-wide font-medium transition-all group relative cursor-pointer ${
                isCollapsed ? "justify-center p-3" : "px-3.5 py-2.5 gap-3"
              } ${
                currentView === "FEED" 
                  ? "bg-[#111827] text-white shadow-sm font-semibold" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Flujo en Vivo</span>}
              
              {activeSignalsCount > 0 && (
                isCollapsed ? (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ) : (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )
              )}

              {isCollapsed && (
                <div className={tooltipClass}>
                  Flujo en Vivo {activeSignalsCount > 0 ? `(${activeSignalsCount} activos)` : "(ninguno)"}
                </div>
              )}
            </button>

            {/* Rendimiento */}
            <button 
              onClick={() => handleDesktopNav("ANALYTICS")}
              className={`w-full flex items-center rounded-xl text-xs font-mono tracking-wide font-medium transition-all group relative cursor-pointer ${
                isCollapsed ? "justify-center p-3" : "px-3.5 py-2.5 gap-3"
              } ${
                currentView === "ANALYTICS" 
                  ? "bg-[#111827] text-white shadow-sm font-semibold" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <LineChart className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <>
                  <span>Rendimiento</span>
                  <span className="ml-auto text-[9px] font-bold font-mono text-[#10b981] bg-[#DCFCE7] px-2 py-0.5 rounded border border-emerald-100">
                    {winRate}%
                  </span>
                </>
              )}

              {isCollapsed && (
                <div className={tooltipClass}>
                  Métricas de Rendimiento ({winRate}% acierto)
                </div>
              )}
            </button>

            {/* Registros Guardados */}
            <button 
              onClick={() => handleDesktopNav("HISTORY")}
              className={`w-full flex items-center rounded-xl text-xs font-mono tracking-wide font-medium transition-all group relative cursor-pointer ${
                isCollapsed ? "justify-center p-3" : "px-3.5 py-2.5 gap-3"
              } ${
                currentView === "HISTORY" 
                  ? "bg-[#111827] text-white shadow-sm font-semibold" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <History className="w-4 h-4 shrink-0 text-gray-400" />
              {!isCollapsed && (
                <>
                  <span>Registros Guardados</span>
                  <span className="ml-auto text-[10px] text-gray-400 font-mono">
                    {completedSignalsCount}
                  </span>
                </>
              )}

              {isCollapsed && (
                <div className={tooltipClass}>
                  Registros Completados ({completedSignalsCount} entradas)
                </div>
              )}
            </button>

            {/* Botón de Salida */}
            {onBackToLanding && (
              <button 
                onClick={handleBackToLanding}
                className={`w-full flex items-center rounded-xl text-xs font-mono tracking-wide font-medium transition-all group relative cursor-pointer border-t border-gray-100 mt-2.5 pt-2.5 ${
                  isCollapsed ? "justify-center p-3 animate-fade-in" : "px-3.5 py-2.5 gap-3"
                } text-gray-500 hover:text-gray-900 hover:bg-gray-50`}
              >
                <Home className="w-4 h-4 shrink-0 text-text-tertiary" />
                {!isCollapsed && <span>Volver al Inicio</span>}
                {isCollapsed && (
                  <div className={tooltipClass}>
                    Volver al Inicio
                  </div>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Metadatos inferiores de Escritorio */}
        <div className="space-y-4 pt-6 border-t border-gray-150 mt-6 lg:mt-0 font-sans">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <div 
                className="group relative w-10 h-10 rounded-xl bg-gray-50 border border-gray-200/60 flex items-center justify-center cursor-help shadow-sm hover:bg-gray-100 transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div className={`${tooltipClass} left-12 ml-4`}>
                  <p className="font-bold text-gray-900 mb-1">0xMON Sinc</p>
                  <p className="text-gray-500 text-[9px]">Bloque #{currentBlock.toLocaleString()}</p>
                </div>
              </div>

              <button 
                onClick={triggerRefresh}
                className="group relative w-10 h-10 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
                <div className={`${tooltipClass} left-12 ml-4`}>
                  Sincronizar Ledger
                </div>
              </button>
            </div>
          ) : (
            <>
              <div className="bg-[#F9FAFB] p-4 rounded-2xl border border-gray-200/60 font-mono text-[10px] text-gray-500 space-y-1.5 animate-fade-in">
                <div className="flex justify-between items-center mb-0.5 pb-1.5 border-b border-gray-150">
                  <span className="text-gray-400">Host de Red</span>
                  <span className="text-gray-900 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500 animate-pulse"></span>
                    0xMON
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Entorno</span>
                  <span className="text-gray-700">devnet-v1</span>
                </div>
                <div className="flex justify-between items-center pt-0.5 font-sans">
                  <span className="text-text-secondary text-[10px]">Bloque Sinc</span>
                  <span className="text-gray-900 font-bold font-mono">#{currentBlock.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 animate-fade-in">
                <button 
                  onClick={triggerRefresh}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl text-[10px] font-mono font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>Sincronizar Ledger</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
