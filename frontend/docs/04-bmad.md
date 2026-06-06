# Xtreme Trade — BMAD + Agentes
 
> BMAD: método de trabajo con IA para hackathons (Plan → Architect → Implement → Review)
> Agentes: Claude Code + claude-code-templates (independiente de BMAD)
> Requires: Claude Code instalado (`npm install -g @anthropic-ai/claude-code`)
 
---
 
## Qué es BMAD y qué NO es
 
BMAD (Breakthrough Method for Agile AI-Driven Development) es un SOP — un conjunto de roles y prompts estructurados para trabajar con IA en sprints. Define quién hace qué y cuándo consultar a la IA.
 
**No es un producto ni un plugin instalable como tal.** En la práctica para una hackathon de 6h, se reduce a:
- Roles claros (`@architect`, `@dev`, `@qa`, `@pm`)
- Checkpoints en momentos específicos
- Un principio: si una feature no está en el flujo crítico, es opcional
---
 
## Agentes disponibles (claude-code-templates)
 
Estos SÍ son instalables. Son archivos de configuración que van a `.claude/agents/` y definen el comportamiento del agente en Claude Code.
 
```powershell
# Instalar Claude Code:
npm install -g @anthropic-ai/claude-code
 
# Agente estratega de hackathon (el más importante):
npx claude-code-templates@latest --agent ai-specialists/hackathon-ai-strategist
 
# Agente para backend/APIs:
npx claude-code-templates@latest --agent api-developer
 
# Agente para frontend:
npx claude-code-templates@latest --agent frontend-developer
```
 
Verificar instalación:
```powershell
# Los agentes quedan en:
ls .claude/agents/
```
 
---
 
## Hackathon AI Strategist — el agente central
 
<https://aitmpl.com/blog/hackathon-ai-strategist-agent/>
 
Este agente tiene doble perfil: ganador serial de hackathons (20+ wins) y juez en HackMIT, TreeHacks, PennApps. Sus capacidades:
 
| Capacidad | Descripción |
|-----------|-------------|
| Ideación | Genera ideas balanceando innovación + factibilidad + wow factor |
| Evaluación | Puntúa ideas con los mismos criterios que usan los jueces |
| Time management | Dice qué construir, qué falsear, qué cortar |
| Pitch coaching | Escribe el script de 2 min con hook y flujo de demo |
| Scope check | Identifica cuándo el scope está desbordado |
 
### Criterios de jueces (cómo evalúan)
 
| Criterio | Peso | Qué buscan |
|----------|------|-----------|
| Innovación y originalidad | 25-30% | Enfoque novel, no otro chatbot |
| Complejidad técnica | 25-30% | Ingeniería inteligente, no solo wrappers de API |
| Impacto y escalabilidad | 20-25% | Potencial real, beneficio claro |
| Presentación y demo | 15-20% | Demo fluida, narrativa compelling |
| Completitud y polish | 5-10% | Se ve terminado, sin bordes ásperos |
 
---
 
## Cuándo usar cada agente (los 3 momentos críticos)
 
### Momento 1 — 11:30 AM (inicio)
 
```
Usamos el Hackathon AI Strategist.
 
Prompt:
"Somos un equipo de 2 en el Monad Blitz Medellín, hackathon de 6 horas.
Proyecto: Xtreme Trade — bot de Telegram que analiza charts de TradingView con
Claude Haiku (visión multimodal), genera señales BUY/SELL, ejecuta trades
via 0x Swap API y registra cada signal en Monad testnet.
Stack: Python FastAPI + Next.js. OS: Windows.
Diferenciador: los competidores analizan texto, nosotros analizamos imágenes.
¿Es factible en 6 horas? ¿Qué cortamos si vamos atrasados? ¿Qué debemos
falsear para la demo?"
```
 
### Momento 2 — 2:30 PM (checkpoint de mitad)
 
```
Prompt al Hackathon AI Strategist:
"Han pasado 3 horas. Estado actual: [descripción de lo que funciona].
¿Qué cortamos? ¿Qué priorizo en las próximas 3 horas para tener una
demo ganadora?"
```
 
### Momento 3 — 4:30 PM (pitch prep)
 
```
Prompt al Hackathon AI Strategist:
"Demo en 2 horas. Construimos: [descripción].
Escribe el pitch de 2 minutos con este hook:
'Xtreme Trade convierte cualquier gráfico de TradingView en un trade
ejecutado on-chain en 3 segundos.'
Incluye qué mostrar en el live demo y qué cubrir en slides."
```
 
---
 
## Roles BMAD durante la hackathon
 
### @architect (11:30 AM — solo si necesitan redefinir algo)
 
```
"Diseña la arquitectura de Xtreme Trade: FastAPI + Telegram + Claude Haiku +
0x Swap + Monad testnet. Genera el contrato de API entre backend y frontend."
```
 
### @dev (durante el build — H2, H3, H4)
 
```
# Para backend:
"Implementa services/ai_analyzer.py: recibe bytes de imagen, convierte a
base64, llama claude-3-haiku-20240307 con sintaxis Anthropic (type: image,
source.type: base64), retorna dict con signal, confidence, pattern, analysis."
 
# Para frontend:
"Implementa ChartUploader.tsx en Next.js 15 + shadcn/ui. Recibe imagen,
convierte a base64, llama POST /api/analyze-chart, muestra signal/confidence
con badge verde/rojo."
```
 
### @qa (4:00 PM — antes de ensayar la demo)
 
```
"Revisa el flujo completo: imagen → ai_analyzer.py → trade_executor.py →
chain.py → tx_hash. Verifica que confidence usa basis points en Solidity
(uint256, no float). Encuentra los 3 bugs más probables antes del deploy."
```
 
### @pm (2:30 PM — checkpoint)
 
```
"¿Qué cortamos si vamos atrasados a las 2:30 PM? Define el MVP mínimo
para una demo ganadora. Prioriza: bot de Telegram funcionando > dashboard
> historial > performance chart."
```
 
---
 
## Skills de Claude Code para este proyecto
 
Las skills son archivos SKILL.md que Claude Code lee para generar output de mayor calidad en categorías específicas.
 
| Skill | Instalación | Para quién | Cuándo |
|-------|-------------|-----------|--------|
| `frontend-developer` | `npx claude-code-templates@latest --agent frontend-developer` | Frontend | H1 — al generar componentes |
| `api-developer` | `npx claude-code-templates@latest --agent api-developer` | Backend | H2 — al generar endpoints FastAPI |
| `hackathon-ai-strategist` | `npx claude-code-templates@latest --agent ai-specialists/hackathon-ai-strategist` | Ambos | H1, H4, H6 |
 
> Las skills de frontend-design generan componentes React con diseño que no parece AI-generated genérico. Para una demo donde el público vota visualmente, esto importa.
 
---
 
## CLAUDE.md en la raíz del proyecto (compartido)
 
Crear un `CLAUDE.md` en la raíz del repo monorepo (o en cada subcarpeta). Claude Code lo lee automáticamente al inicio de cada sesión — evita repetir el contexto en cada prompt.
 
```markdown
# Xtreme Trade — contexto para Claude Code
 
Proyecto: bot de Telegram para trading con IA en Monad Blitz Medellín (6 horas).
Flujo crítico: imagen → Claude Haiku → signal → 0x trade → Monad tx_hash
 
Stack:
- Backend: Python 3.12, uv, FastAPI, python-telegram-bot, anthropic SDK, web3.py
- Frontend: Next.js 15, shadcn/ui, TanStack Query
- Blockchain: Hardhat, Solidity 0.8.20, Monad testnet
 
Contrato de API:
- POST /api/analyze-chart → {signal, confidence, pattern, analysis}
- POST /api/trade → {tx_hash, token, amount, signal}
- GET /api/signals → Signal[]
 
Reglas:
- Sin preámbulo. Código completo y funcional.
- confidence: float 0.0-1.0 en Python, uint256 basis points en Solidity.
- Claude Haiku: "type": "image" con source.type: "base64". NUNCA "image_url".
- OS: Windows. Usar `uv run` para Python, `pnpm` para Node.
```
 
---
 
## Principio BMAD para hackathon
 
> Si una feature no está en el flujo `imagen → signal → trade → tx visible`, es opcional hasta que ese flujo funcione perfectamente.
 
Jerarquía de prioridad para la demo:
1. Bot de Telegram responde con signal + tx_hash ← mínimo ganador
2. Dashboard web muestra los signals ← importante
3. Link a MonadVision funciona ← importante
4. Performance chart, dark mode, animaciones ← solo si sobra tiempo