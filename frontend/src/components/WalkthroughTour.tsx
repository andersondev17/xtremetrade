import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  Cpu, 
  LineChart, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  Sliders, 
  HelpCircle, 
  MousePointerClick,
  FileImage
} from "lucide-react";
import { playClickSound, playSuccessSound } from "../lib/audio";

interface WalkthroughTourProps {
  currentView: "FEED" | "ANALYTICS" | "HISTORY" | "AGENT" | "CALIBRATION" | "PARSER";
  setCurrentView: (view: "FEED" | "ANALYTICS" | "HISTORY" | "AGENT" | "CALIBRATION" | "PARSER") => void;
  onStartTour?: () => void;
  agentIsOperating: boolean;
  onToggleAgent: (operating: boolean) => void;
  onSetMode: (mode: "ASSISTED" | "AUTOPILOT") => void;
}

export default function WalkthroughTour({
  currentView,
  setCurrentView,
  agentIsOperating,
  onToggleAgent,
  onSetMode
}: WalkthroughTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if user has already completed the walkthrough
  useEffect(() => {
    try {
      const completed = localStorage.getItem("signalai_walkthrough_completed_v2");
      if (!completed) {
        // Automatically start the walkthrough for first-time visitors with a tiny delay
        const timer = setTimeout(() => {
          setIsOpen(true);
          playSuccessSound();
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // safe fallback
    }
  }, []);

  // Support triggering the tour via dynamic global window events
  useEffect(() => {
    const handleTrigger = () => {
      startTourManual();
    };
    window.addEventListener("trigger-signalai-tour", handleTrigger);
    return () => window.removeEventListener("trigger-signalai-tour", handleTrigger);
  }, []);

  const startTourManual = () => {
    playClickSound();
    setCurrentStep(0);
    setIsOpen(true);
    // Focus first view appropriately
    setCurrentView("AGENT");
  };

  const handleNext = () => {
    playClickSound();
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Trigger view transitions based on current step target
      if (tourSteps[nextStep].targetView) {
        setCurrentView(tourSteps[nextStep].targetView as any);
      }
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (tourSteps[prevStep].targetView) {
        setCurrentView(tourSteps[prevStep].targetView as any);
      }
    }
  };

  const handleSkip = () => {
    playClickSound();
    handleComplete();
  };

  const handleComplete = () => {
    playSuccessSound();
    setIsOpen(false);
    try {
      localStorage.setItem("signalai_walkthrough_completed_v2", "true");
    } catch (e) {}
  };

  const tourSteps = [
    {
      title: "¡Bienvenido a SignalAI!",
      description: "Esta es tu terminal de trading autónoma de alto rendimiento sobre Monad Sandbox. Hemos preparado este asistente interactivo para que conozcas exactamente cómo funciona y dónde ocurren las operaciones.",
      badge: "Inducción Básica",
      targetView: "AGENT",
      icon: <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />,
      highlightText: "No iniciaremos ninguna transacción real ni cambiaremos tu balance sin que tú lo decidas primero."
    },
    {
      title: "Configuración de Agente y Autopiloto",
      description: "Aquí defines qué tan autónomo deseas que sea el sistema. Puedes alternar la consola entre los modos AUTOPILOT (Automático) y ASSISTED (Asistido/Manual).",
      badge: "Estrategias de IA",
      targetView: "AGENT",
      icon: <Bot className="w-6 h-6 text-brand-purple" />,
      interactionHelp: "• Modo Autopiloto: Realiza simulaciones en blockchain según tu perfil de riesgo de forma 100% autónoma. \n• Modo Supervisory/Assisted: Te muestra oportunidades y te permite presionar 'Aprobar' o 'Descartar' antes de ejecutar cualquier posición.",
      highlightText: "¡Puedes ver de reojo el panel donde se configuran estos parámetros debajo de mí!"
    },
    {
      title: "Perfil de Riesgo y Protección Colateral",
      description: "Prueba seleccionando parámetros Conservadores, Intermedios o Risky en la consola. Además, cuentas con protección activa de capital: si tu balance desciende al límite establecido, el agente se detendrá inmediatamente.",
      badge: "Mitigación de Riesgos",
      targetView: "AGENT",
      icon: <Sliders className="w-6 h-6 text-emerald-500" />,
      highlightText: "Esto previene pérdidas en rachas negativas sin tu conocimiento previo."
    },
    {
      title: "Bandeja de Oportunidades Escaneadas",
      description: "Cuando la IA detecta desviaciones en piscinas de liquidez que cumplen tus filtros, las lista en la sección 'Scanned Liquidity Pool Opportunities'. No hace trades ocultos; la bandeja te da total control operacional.",
      badge: "Sugerencias de Mercado",
      targetView: "AGENT",
      icon: <MousePointerClick className="w-6 h-6 text-sky-500" />,
      highlightText: "En modo asistido, verás los botones para inspeccionar objetivos de ganancias (Target exit) y frenar pérdidas (Stop Loss)."
    },
    {
      title: "Verificación de Capturas con Visión Gemini",
      description: "Cambiamos a la vista 'Live Feed' (Gráfico en Vivo). Aquí puedes arrastrar cualquier captura de pantalla de TradingView. Nuestra IA extraerá la geometría de las velas y calculará la probabilidad de éxito.",
      badge: "Multimodal Visual Parser",
      targetView: "FEED",
      icon: <FileImage className="w-6 h-6 text-[#EC4899]" />,
      highlightText: "Este parser visual es 15 veces más rápido para validar soportes y resistencias."
    },
    {
      title: "Monitoreo del Flujo e Historial",
      description: "Por último, haz un seguimiento total a través de la pestaña 'Performance' para ver el porcentaje de acierto de tus swaps pasados en Monad devnet-v1, o revisa 'Archived Logs' para auditar las firmas criptográficas de las operaciones anteriores.",
      badge: "Transparencia Total",
      targetView: "ANALYTICS",
      icon: <LineChart className="w-6 h-6 text-emerald-600" />,
      highlightText: "Cada evento de swap exitoso o fallido emite firmas criptográficas simuladas visibles en tiempo real."
    }
  ];

  const currentStepData = tourSteps[currentStep];

  return (
    <>
      {/* Botón flotante siempre disponible en la esquina inferior izquierda */}
      <div className="fixed bottom-6 left-6 z-40 select-none hidden sm:block">
        <button
          onClick={startTourManual}
          className="flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] hover:bg-gray-100 text-text-primary border border-gray-200 rounded-full text-xs font-mono font-bold tracking-tight shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-brand-purple animate-pulse" />
          <span>Iniciar Guía Interactiva 🧭</span>
        </button>
      </div>

      {/* Versión móvil para rehacer el tour colocada en la barra de navegación superior si es necesario */}
      <div className="lg:hidden px-4 mb-4">
        <button
          onClick={startTourManual}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-gray-50 text-text-secondary border border-gray-200 rounded-xl text-xs font-mono font-medium"
        >
          <HelpCircle className="w-4 h-4 text-brand-purple" />
          <span>Guía Paso a Paso 🧭</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop con desenfoque de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSkip}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Tarjeta de Guía */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              className="bg-white rounded-3xl border border-gray-250 shadow-2xl shadow-black/25 w-full max-w-xl overflow-hidden relative z-10 font-sans"
            >
              {/* Barra de progreso superior */}
              <div className="h-1.5 w-full bg-gray-100 flex">
                {tourSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 transition-all duration-350 ${
                      idx <= currentStep ? "bg-black" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <div className="p-6 sm:p-8 select-none text-left">
                {/* Botón de cerrar */}
                <button
                  onClick={handleSkip}
                  className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                  title="Saltar tutorial"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Encabezado */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-150 shadow-sm flex items-center justify-center">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#6B7280] font-mono font-bold block">
                      {currentStepData.badge} • PASO {currentStep + 1} de {tourSteps.length}
                    </span>
                    <span className="text-text-secondary text-[11px] font-mono flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Enfocado en: <strong className="uppercase">{currentStepData.targetView === "FEED" ? "Gráfico en Vivo" : currentStepData.targetView === "ANALYTICS" ? "Rendimiento" : "Agente Autónomo"}</strong>
                    </span>
                  </div>
                </div>

                {/* Título y Descripción */}
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#111827]">
                  {currentStepData.title}
                </h3>
                <p className="text-[#4B5563] text-xs sm:text-sm mt-3.5 leading-relaxed">
                  {currentStepData.description}
                </p>

                {/* Sub-informes condicionales */}
                {currentStepData.interactionHelp && (
                  <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/80 font-mono text-[10px] sm:text-xs text-text-secondary whitespace-pre-line leading-relaxed">
                    {currentStepData.interactionHelp}
                  </div>
                )}

                {/* Alerta de seguridad destacada */}
                <div className="mt-5 p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-medium flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong>{currentStepData.highlightText}</strong> No realizaremos ninguna acción por ti por sorpresa.
                  </span>
                </div>
              </div>

              {/* Acciones de Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={handleSkip}
                  className="text-[11px] font-mono hover:underline text-gray-400 hover:text-black font-semibold"
                >
                  Saltar tutorial
                </button>

                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrev}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-150 text-text-primary rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all select-none"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Anterior
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 bg-black hover:bg-black/90 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all select-none shadow-sm"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        ¡Empecemos! <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </>
                    ) : (
                      <>
                        Siguiente <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
