import { ArrowRight, BookOpen, Play, ShieldAlert, Sparkles, ToggleLeft, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { playClickSound, playSuccessSound } from "../lib/audio";

interface OnboardingGuideProps {
  onStartAutonomous: () => void;
  onUploadClick: () => void;
}

export default function OnboardingGuide({ onStartAutonomous, onUploadClick }: OnboardingGuideProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Activar Piloto Automático",
      description: "Habilite parámetros de trading conservadores o agresivos. La IA escanea constantemente piscinas de liquidez por usted.",
      actionLabel: "Configurar Agente",
      icon: <ToggleLeft className="w-4 h-4 text-brand-purple" />,
      action: () => {
        playSuccessSound();
        onStartAutonomous();
      }
    },
    {
      title: "Analizar Captura de Gráfico",
      description: "Arrastre o haga clic para subir cualquier gráfico en vivo de TradingView. La visión de Gemini verifica la geometría de velas.",
      actionLabel: "Procesar Captura",
      icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
      action: () => {
        playClickSound();
        onUploadClick();
      }
    },
    {
      title: "Auditar Historial de Swaps",
      description: "Cuando coincide una estrategia, vea la liquidación en 3 segundos en Monad. Los enlaces representan transacciones reales hash.",
      actionLabel: "Ver Flujo en Vivo",
      icon: <Play className="w-4 h-4 text-[#F59E0B]" />,
      action: null
    },
    {
      title: "Inspeccionar Inteligencia",
      description: "Consulte los indicadores generales, tasas de acierto histórico y registros dinámicos para validar los retornos netos de PnL.",
      actionLabel: "Abrir Rendimiento",
      icon: <BookOpen className="w-4 h-4 text-sky-500" />,
      action: null
    }
  ];

  const handleCloseGuide = () => {
    playClickSound();
    setIsVisible(false);
  };

  const handleStepSelect = (idx: number) => {
    playClickSound();
    setActiveStep(idx);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-black/5 rounded-3xl border border-dashed border-gray-300 p-6 mb-8 relative overflow-hidden font-sans text-left"
    >
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleCloseGuide}
          className="p-1.5 hover:bg-gray-200 rounded-full transition-colors pointer-cursor text-text-secondary hover:text-black"
          title="Descartar guía"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-3xl font-sans">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full font-mono">
            Onboarding de Bienvenida
          </span>
          <span className="flex items-center gap-1 text-[11px] text-text-secondary">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Conozca Xtreme Trade en 60 segundos
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary tracking-tight">
          Bienvenido a la Terminal Xtreme Trade
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm mt-1 mb-6 leading-relaxed">
          Usted está visualizando la consola de trading autónoma profesional. Xtreme Trade traduce cualquier captura de TradingView en swaps on-chain inmediatos en la red Monad. Descubra cómo realizar sus primeros pasos:
        </p>

        {/* Cambiador Dinámico Interactivo de Pasos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 font-sans">
          {steps.map((step, idx) => {
            const isCurrent = activeStep === idx;
            return (
              <div
                key={idx}
                onClick={() => handleStepSelect(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                  isCurrent
                    ? "bg-white border-black shadow-md shadow-black/5"
                    : "bg-white/40 border-gray-200/50 hover:bg-white/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-text-tertiary">PASO 0{idx + 1}</span>
                    {step.icon}
                  </div>
                  <h4 className="text-xs font-bold text-text-primary leading-tight">
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-text-secondary leading-normal mt-1.5 line-clamp-3">
                    {step.description}
                  </p>
                </div>

                {isCurrent && step.action && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (step.action) step.action();
                    }}
                    className="mt-3 py-1 bg-black text-white font-mono text-[9px] font-semibold text-center rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wider block w-full"
                  >
                    {step.actionLabel || "Ejecutar punto"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 font-sans">
          <div className="flex items-center gap-2 text-[11px] text-text-secondary bg-white px-3 py-1.5 rounded-xl border border-gray-200/50">
            <ShieldAlert className="w-3.5 h-3.5 text-accent-green animate-pulse shrink-0" />
            <span>Conectado de forma segura a <strong>Monad Devnet Sandbox</strong> (Operaciones simuladas)</span>
          </div>
          
          <button
            onClick={handleCloseGuide}
            className="text-[11px] text-text-primary hover:underline font-mono font-bold flex items-center gap-1 ml-auto sm:ml-0"
          >
            Entendido, ir a Consola <ArrowRight className="w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
