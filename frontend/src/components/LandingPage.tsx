import React, { useState } from "react";
import { ArrowUpRight, Cpu, LineChart, History, CheckCircle2, Sparkles, Send, ShieldCheck, Zap, Layers, ChevronRight, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playClickSound } from "../lib/audio";

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export default function LandingPage({ onEnterDashboard }: LandingPageProps) {
  const [activeInteractiveStep, setActiveInteractiveStep] = useState(0);
  const [telegramFlowIndex, setTelegramFlowIndex] = useState(0);

  const demoSteps = [
    {
      title: "1. Capture y Cargue su Gráfico",
      subtitle: "Escáner Multimodal Universal",
      summary: "Tome una captura de pantalla de cualquier activo en TradingView que contenga velas, líneas de tendencia o indicadores.",
      detail: "No importa si incorpora niveles personalizados de RSI, medias móviles o retrocesos de Fibonacci. SignalAI procesa la matriz de píxeles al instante utilizando modelos de visión de Gemini.",
      badge: "Compatible con JPEG/PNG"
    },
    {
      title: "2. Descomposición Visual del Modelo",
      subtitle: "Análisis Geométrico en Tiempo Real",
      summary: "La IA descompone la estructura de las velas, identificando patrones alcistas o bajistas con alta precisión.",
      detail: "Genera precios exactos de Entrada, límites de Stop-Loss y múltiples objetivos de toma de ganancias (Take-Profit) para gestionar el riesgo del capital de forma automatizada y mitigar retrocesos.",
      badge: "Gemini 2.5 Flash Proxy"
    },
    {
      title: "3. Enrutamiento On-Chain en Monad",
      subtitle: "Contratos Inteligentes Descentralizados",
      summary: "Asegura rutas óptimas de liquidez y ejecuta el swap instantáneamente en la red.",
      detail: "SignalAI se comunica directamente con contratos descentralizados en Monad Devnet, eliminando la fricción y demora de confirmaciones manuales en billeteras tradicionales.",
      badge: "Liquidación en 3 Seg"
    }
  ];

  const mockTgChat = [
    { sender: "user", text: "[Envía captura de pantalla del gráfico MONAD/USDC, temporalidad de 1 hora]" },
    {
      sender: "bot",
      text: "🤖 SignalAI *Escáner Activo*:\nPatrón Detectado: *Morning Star Alcista*\nPrecisión de Confianza: *94.7%*\n\n📈 Entrada Propuesta @ $1.25\n🛑 Stop Loss: $1.19\n🎯 Take Profit: $1.38",
      buttons: ["Aprobar Ejecución On-Chain (2% Riesgo)", "Rechazar y Archivar"]
    },
    { sender: "user", text: "[Presiona: Aprobar Ejecución On-Chain]" },
    {
      sender: "bot",
      text: "⚡ *¡Transacción Ejecutada con Éxito!*\nSe cambiaron *1,000 USDC* por *800 MONAD*\nHash de Transacción: `0x3f9a72...ef42` en MonadVision ↗\nMonitoreo autónomo activado."
    }
  ];

  const handleEnterDashboard = () => {
    playClickSound();
    onEnterDashboard();
  };

  const handleStepClick = (idx: number) => {
    playClickSound();
    setActiveInteractiveStep(idx);
  };

  const handleTgReset = () => {
    playClickSound();
    setTelegramFlowIndex(0);
    setTimeout(() => setTelegramFlowIndex(1), 1000);
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#F9FAFB] text-text-primary selection:bg-[#DCFCE7] font-sans">
      {/* DECORACIÓN DE GRADIENTES AMBIENTALES */}
      <div className="absolute top-0 left-1/4 w-[40rem] h-[30rem] bg-emerald-100/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[35%] right-10 w-[30rem] h-[25rem] bg-violet-100/20 blur-[120px] rounded-full pointer-events-none" />

      {/* CABECERA PRINCIPAL */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10 border-b border-gray-150/60 font-sans">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white font-mono font-bold tracking-tighter shadow-md">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-[#111827] leading-none">SignalAI</h1>
            <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest block mt-0.5">Monad Blitz Medellín</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono uppercase tracking-widest font-bold text-text-secondary">
          <a href="#how-it-works" onClick={playClickSound} className="hover:text-black transition-colors">Arquitectura</a>
          <a href="#telegram-bot" onClick={playClickSound} className="hover:text-black transition-colors">Bot de Telegram</a>
          <a href="#landing-page-root" onClick={playClickSound} className="hover:text-black transition-colors">Demo Medellín</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://t.me/signalai_monad_bot"
            target="_blank"
            rel="noreferrer"
            onClick={playClickSound}
            className="hidden sm:inline-flex items-center gap-1.5 px-4.5 py-2 border border-gray-200 hover:border-text-primary rounded-full text-xs font-semibold text-text-secondary hover:text-black transition-all bg-white"
          >
            <Send className="w-3.5 h-3.5 text-sky-500 fill-sky-500/10" />
            <span>@signalai_monad_bot</span>
          </a>
          <button
            onClick={handleEnterDashboard}
            className="px-5 py-2.5 bg-black text-[#FFFFFF] font-bold text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            Iniciar Consola <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </header>

      {/* SECCIÓN HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center relative z-10 font-sans">
        <div className="inline-flex items-center gap-1.5 bg-white border border-gray-250 px-3.5 py-1.5 rounded-full shadow-sm text-xs font-mono text-text-secondary mb-8 hover:border-text-primary transition-colors select-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Prototipo Monad Blitz Medellín Hackathon</span>
          <span className="text-gray-300">|</span>
          <span className="text-emerald-600 font-bold">Simulador Devnet Activo</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-serif font-semibold tracking-tight text-[#111827] max-w-5xl mx-auto leading-[1.08] mb-6">
          SignalAI convierte cualquier gráfico de TradingView en un trade ejecutado <span className="bg-[#DCFCE7] text-emerald-800 rounded-2xl px-3 inline-block font-sans font-extrabold rotate-1 shadow-sm">on-chain</span> en 3 segundos.
        </h1>

        <p className="text-text-secondary text-base sm:text-lg max-w-3xl mx-auto mt-6 mb-10 leading-relaxed font-sans">
          Evite el lento registro manual, la pérdida de niveles clave de protección o el análisis de complejos libros de órdenes. Cargue sus capturas de pantalla directamente; el modelo visual avanzado de Gemini descifra la estructura al instante e instruye swaps rápidos en entornos de alta liquidez dentro de Monad.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleEnterDashboard}
            className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-gray-900 text-white font-bold text-sm tracking-wider rounded-2xl shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Iniciar Consola de Trading <Play className="w-4 h-4 fill-white text-white" />
          </button>

          <a
            href="#telegram-bot"
            onClick={playClickSound}
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 hover:border-gray-400 text-text-primary font-bold text-sm tracking-wider rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-sky-500" />
            <span>Conectar Bot de Telegram</span>
          </a>
        </div>

        {/* MÉTRICAS CLAVE REPRESENTATIVAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20 p-4 bg-white/40 rounded-3xl border border-gray-200/50 backdrop-blur-md">
          <div className="p-4 text-center">
            <span className="text-[10px] font-mono uppercase text-text-tertiary block mb-1">Velocidad Latencia</span>
            <span className="text-3xl font-bold font-serif text-text-primary">&lt; 3.0s</span>
            <span className="text-[10px] text-text-secondary block mt-1">ejecución on-chain</span>
          </div>
          <div className="p-4 text-center border-l border-gray-201 text-center">
            <span className="text-[10px] font-mono uppercase text-text-tertiary block mb-1">Análisis IA</span>
            <span className="text-3xl font-bold font-serif text-text-primary">Multimodal</span>
            <span className="text-[10px] text-text-secondary block mt-1">clasificación de figuras</span>
          </div>
          <div className="p-4 text-center border-l border-gray-201 text-center">
            <span className="text-[10px] font-mono uppercase text-text-tertiary block mb-1">Ganancia Protegida</span>
            <span className="text-3xl font-bold font-serif text-[#10b981]">98.2%</span>
            <span className="text-[10px] text-text-secondary block mt-1">aplicación de stop-loss</span>
          </div>
          <div className="p-4 text-center border-l border-gray-201 text-center">
            <span className="text-[10px] font-mono uppercase text-text-tertiary block mb-1">Simulación</span>
            <span className="text-3xl font-bold font-serif text-text-primary">En Vivo</span>
            <span className="text-[10px] text-text-secondary block mt-1">sincronizado con devnet</span>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="how-it-works" className="bg-[#111827] text-white py-20 px-6 relative overflow-hidden select-none font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] bg-emerald-500/5 blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 font-sans">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Arquitectura del Sistema y Flujo
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-4 animate-fade-in">
              Cómo SignalAI descifra la geometría de las velas
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-3.5">
              Un puente modular de alta precisión compuesto por tres etapas clave de procesamiento.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Lista Interactiva de Pasos */}
            <div className="space-y-6">
              {demoSteps.map((step, idx) => {
                const isActive = activeInteractiveStep === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handleStepClick(idx)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-white/10 border-emerald-500/40 relative shadow-lg"
                        : "bg-white/5 border-white/5 hover:bg-white/7"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-mono font-bold text-emerald-400">{step.subtitle}</span>
                      <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                        {step.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className={`text-xs text-gray-400 transition-all ${isActive ? "" : "line-clamp-1"}`}>
                      {isActive ? step.detail : step.summary}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Representación visual derecha */}
            <div className="bg-[#1F2937] p-6 rounded-3xl border border-white/10 relative h-[400px] flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-[10px] text-gray-400">visual_bridge_service.log</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-semibold rounded-md">
                  Servicio Activo
                </span>
              </div>

              {/* Simulación del escáner visual */}
              <div className="flex-1 flex flex-col justify-center items-center p-4 relative">
                {activeInteractiveStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4 max-w-sm"
                  >
                    <div className="relative w-40 h-28 bg-[#111827] rounded-xl border border-white/10 mx-auto overflow-hidden flex items-center justify-center p-2 group">
                      {/* Líneas de cuadrícula */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px]" />
                      {/* Velas japonesas simuladas */}
                      <div className="flex items-end gap-1.5 z-10 pt-4 h-full">
                        <div className="w-2 h-14 bg-rose-500/80 relative rounded-sm flex justify-center"><div className="absolute top-[-8px] bottom-[-8px] w-[1px] bg-rose-500" /></div>
                        <div className="w-2 h-10 bg-rose-500/80 relative rounded-sm flex justify-center"><div className="absolute top-[-4px] bottom-[-4px] w-[1px] bg-rose-500" /></div>
                        <div className="w-2 h-18 bg-emerald-500/80 relative rounded-sm flex justify-center"><div className="absolute top-[-5px] bottom-[-5px] w-[1px] bg-emerald-500" /></div>
                        <div className="w-2 h-24 bg-emerald-500/80 relative rounded-sm flex justify-center"><div className="absolute top-[-7px] bottom-[-7px] w-[1px] bg-emerald-500" /></div>
                      </div>
                      {/* Barra de escáner en movimiento */}
                      <motion.div
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                        className="absolute left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_10px_#10b981] z-25"
                      />
                    </div>
                    <p className="text-xs font-bold text-white">Conversión Multimodal de Gráficos</p>
                    <p className="text-[10px] text-gray-400">Traduciendo barras y mechas a coordenadas de trading.</p>
                  </motion.div>
                )}

                {activeInteractiveStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 w-full max-w-sm"
                  >
                    <div className="bg-[#111827] rounded-xl p-3.5 border border-white/10 font-mono text-[10px] space-y-2">
                      <p className="text-emerald-400">✔ Geometría Identificada: MONAD/USDC (1H)</p>
                      <p className="text-gray-400">Análisis: Estructura de Engolfamiento Alcista detectada sobre soporte clave horizontal en $1.20.</p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/5 text-[9px]">
                        <div><span className="text-gray-500 block">FIABILIDAD:</span> <span className="font-bold text-white">92.4%</span></div>
                        <div><span className="text-gray-500 block">STOP LOSS:</span> <span className="font-bold text-rose-500">$1.18</span></div>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-center text-white">Segmentación de Riesgos AI</p>
                    <p className="text-[10px] text-gray-400 text-center">Fronteras protectoras fijadas de forma automatizada.</p>
                  </motion.div>
                )}

                {activeInteractiveStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4 max-w-sm"
                  >
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(74,222,128,0.1)]">
                      <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white text-center">Swap de Contrato Completado</p>
                      <p className="text-[10px] text-gray-400 text-center font-mono">Hash Tx: 0x5a21e491bf09c...e841</p>
                    </div>
                    <span className="px-2 py-1 bg-white/5 border border-white/10 text-[9px] text-emerald-400 font-mono inline-block rounded-md">
                      Verificado en MonadVision ↗
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Pie de telemetría */}
              <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[9px] font-mono text-gray-500">
                <span>MAPEADO_INDEXADO: ACTIVO</span>
                <span>LATENCIA RED: 2.8s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN BOT DE TELEGRAM */}
      <section id="telegram-bot" className="py-20 px-6 max-w-6xl mx-auto font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-12 lg:mb-4 text-center">
            <span className="text-[10px] font-mono uppercase bg-sky-500/10 text-sky-600 border border-sky-500/20 px-3 py-1 rounded-full font-bold">
              Ecosistema Móvil Completo
            </span>
            <h2 className="text-4xl font-serif font-bold text-[#111827] mt-3">
              Asistente SignalAI integrado en Telegram
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <p className="text-text-secondary text-sm leading-relaxed">
              ¿Por qué atarse a una pantalla? Nuestro analizador multimodal opera nativamente en Telegram. Envíe cualquier captura de TradingView al chat privado, compruebe los rangos propuestos y autorice operaciones en la red Monad con un solo toque interactivo.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0 mt-0.5"><Zap className="w-3 h-3" /></div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Respuestas Ultra-Prontas</h4>
                  <p className="text-[11px] text-text-secondary">Procesa la imagen, genera el informe y responde en menos de 3 segundos.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5"><ShieldCheck className="w-3 h-3" /></div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Gestión de Riesgo Protegido</h4>
                  <p className="text-[11px] text-text-secondary">Se integra con límites de riesgo definidos meticulosamente en el contrato.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <a
                href="https://t.me/signalai_monad_bot"
                target="_blank"
                rel="noreferrer"
                onClick={playClickSound}
                className="px-6 py-2.5 bg-black hover:bg-gray-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                Abrir en Telegram <Send className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleEnterDashboard}
                className="px-6 py-2.5 bg-white text-text-primary hover:bg-gray-50 border border-gray-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Abrir Consola Dev
              </button>
            </div>
          </div>

          {/* Maqueta Interactiva del chat de Telegram */}
          <div className="lg:col-span-7 bg-[#FFFFFF] p-6 rounded-3xl border border-gray-200 shadow-xl flex flex-col justify-between h-[450px]">
            {/* Cabecera del chat */}
            <div className="flex justify-between items-center border-b border-gray-150 pb-3 select-none font-sans">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">
                  SA
                </div>
                <div>
                  <div className="font-bold text-xs text-text-primary flex items-center gap-1">
                    SignalAI Scanner Bot
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-text-secondary block">@signalai_monad_bot</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-text-tertiary">Canal Operativo</span>
              </div>
            </div>

            {/* Mensajes del chat */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50/50 rounded-2xl border border-gray-150 my-4 text-xs font-sans">
              {mockTgChat.slice(0, telegramFlowIndex + 1).map((msg, i) => {
                const isUser = msg.sender === "user";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`p-3 max-w-[85%] rounded-2xl whitespace-pre-line relative ${
                      isUser
                        ? "bg-sky-550 text-white rounded-tr-none shadow-sm"
                        : "bg-white border border-gray-200 text-text-primary rounded-tl-none shadow-sm"
                    }`}>
                      <p className="text-[11px] leading-relaxed">{msg.text}</p>
                      
                      {!isUser && msg.buttons && (
                        <div className="flex flex-col gap-1 mt-3 select-none">
                          {msg.buttons.map((btn, bIdx) => (
                            <button
                              key={bIdx}
                              onClick={() => {
                                playClickSound();
                                if (telegramFlowIndex === 1 && bIdx === 0) {
                                  setTelegramFlowIndex(2);
                                  setTimeout(() => {
                                    setTelegramFlowIndex(3);
                                  }, 1500);
                                }
                              }}
                              className={`py-1.5 px-3 rounded-lg text-left text-[10px] font-semibold transition-colors flex justify-between items-center ${
                                bIdx === 0
                                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                  : "bg-gray-100 hover:bg-gray-200 text-text-primary border border-gray-200"
                              }`}
                            >
                              <span>{btn}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Controlador de simulación */}
            <div className="flex gap-2 relative font-sans">
              <div className="flex-1 px-4 py-2 bg-gray-100 text-text-tertiary text-xs rounded-xl flex items-center justify-between border border-gray-200 select-none">
                <span>Simulación de canal interactivo...</span>
                <Send className="w-3.5 h-3.5 cursor-not-allowed" />
              </div>
              <button
                onClick={handleTgReset}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-mono text-[10px] font-semibold rounded-xl uppercase tracking-wider"
              >
                Reiniciar Demo
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* PIE DE PÁGINA */}
      <footer className="bg-black text-white py-12 px-6 select-none relative z-10 border-t border-white/10 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white text-black rounded font-bold flex items-center justify-center font-mono text-xs">
              S
            </div>
            <span className="font-bold text-white text-sm tracking-tight font-sans">SignalAI</span>
          </div>

          <p className="font-sans text-center md:text-left">
            © 2026 Terminal SignalAI. Desarrollado para la hackathon Monad Blitz Medellín. Todos los derechos reservados.
          </p>

          <div className="flex gap-6">
            <button onClick={handleEnterDashboard} className="hover:text-white transition-colors uppercase tracking-widest font-bold">Iniciar Consola</button>
            <a href="https://t.me/signalai_monad_bot" className="hover:text-white transition-colors uppercase tracking-widest font-bold">Bot Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
