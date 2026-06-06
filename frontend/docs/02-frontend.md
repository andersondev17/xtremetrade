# Xtreme Trade — Frontend
 
> Stack: Next.js 15 · React 19 · shadcn/ui · TanStack Query · Tailwind CSS v4
> OS: Windows
 
---
 
## Estructura de archivos
 
```
signalai-frontend/
├── .env.local              ← URL del backend
├── CLAUDE.md               ← contexto para Claude Code
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── dashboard/
│       └── page.tsx
├── components/
│   ├── SignalCard.tsx
│   ├── SignalTable.tsx
│   ├── ChartUploader.tsx   ← componente más importante
│   └── ConfidenceBar.tsx
└── lib/
    ├── api.ts
    └── mock-data.ts        ← usar hasta H3
```
 
---
 
## CLAUDE.md (contexto para Claude Code en frontend)
 
Crear en la raíz de `signalai-frontend/`.
 
```markdown
# Xtreme Trade Frontend — contexto para Claude Code
 
Stack: Next.js 15, React 19, shadcn/ui, TanStack Query, Tailwind CSS v4
Skill activo: frontend-design (priorizar diseño no genérico)
 
Contrato de API fijo (backend en localhost:8000):
- POST /api/analyze-chart ← { image_base64: string }
  → { signal: "BUY"|"SELL"|"HOLD", confidence: number, pattern: string, analysis: string }
- GET /api/signals
  → Signal[]
 
Reglas:
- Sin preámbulo. Solo código completo y funcional.
- Usar mock-data.ts hasta que el backend esté disponible.
- confidence llega como float 0.0-1.0, mostrar como porcentaje.
- Links de tx_hash van a https://testnet.monadexplorer.com/tx/{hash}
```
 
---
 
## Paso 0 — Setup (esta noche)
 
### Instalar Node y pnpm en Windows
 
Descargar Node LTS desde https://nodejs.org si no lo tiene.
 
```powershell
npm install -g pnpm
pnpm --version   # verificar
 
# Instalar skill de frontend-design para Claude Code:
npx claude-code-templates@latest --agent frontend-developer
```
 
### Clonar shadcn-admin
 
```powershell
git clone https://github.com/satnaing/shadcn-admin.git signalai-frontend
cd signalai-frontend
pnpm install
pnpm dev
# Verificar: http://localhost:3000
```
 
### Dependencias extra
 
```powershell
pnpm add @tanstack/react-query recharts axios
pnpm dlx shadcn add card button badge table input progress
```
 
### .env.local
 
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
 
---
 
## Paso 1 — Mocks (trabajar sin backend, H1-H2)
 
### lib/mock-data.ts
 
```typescript
export type Signal = {
  id: string
  token: string
  signal: "BUY" | "SELL" | "HOLD"
  confidence: number
  pattern: string
  analysis: string
  tx_hash: string
  timestamp: number
}
 
export const mockSignals: Signal[] = [
  {
    id: "1",
    token: "ETH",
    signal: "BUY",
    confidence: 0.87,
    pattern: "bullish flag",
    analysis: "Strong momentum with volume confirmation above MA20",
    tx_hash: "0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    timestamp: Date.now() - 60000,
  },
  {
    id: "2",
    token: "BTC",
    signal: "SELL",
    confidence: 0.72,
    pattern: "bearish wedge",
    analysis: "Descending highs with weakening volume — reversal likely",
    tx_hash: "0xd4e5f6a7b8c9d4e5f6a7b8c9d4e5f6a7b8c9d4e5f6a7b8c9d4e5f6a7b8c9d4e5",
    timestamp: Date.now() - 300000,
  },
  {
    id: "3",
    token: "SOL",
    signal: "BUY",
    confidence: 0.91,
    pattern: "cup and handle",
    analysis: "Classic cup formation complete, target +18%",
    tx_hash: "0xb8c9d0e1f2b8c9d0e1f2b8c9d0e1f2b8c9d0e1f2b8c9d0e1f2b8c9d0e1f2b8c9",
    timestamp: Date.now() - 600000,
  },
]
 
export const mockAnalyzeResponse = {
  signal: "BUY" as const,
  confidence: 0.87,
  pattern: "bullish flag",
  analysis: "Strong uptrend with volume confirmation. Entry above resistance.",
}
```
 
### lib/api.ts
 
```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
 
export async function analyzeChart(imageBase64: string) {
  const res = await fetch(`${BASE}/api/analyze-chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: imageBase64 }),
  })
  if (!res.ok) throw new Error(`Backend error ${res.status}`)
  return res.json()
}
 
export async function getSignals() {
  const res = await fetch(`${BASE}/api/signals`)
  if (!res.ok) throw new Error(`Backend error ${res.status}`)
  return res.json()
}
```
 
---
 
## Paso 2 — Componentes críticos (H1-H2)
 
### components/ChartUploader.tsx
 
El componente más importante. Es el "momento wow" de la demo.
 
```typescript
"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { analyzeChart } from "@/lib/api"
import { mockAnalyzeResponse } from "@/lib/mock-data"
 
type AnalysisResult = {
  signal: "BUY" | "SELL" | "HOLD"
  confidence: number
  pattern: string
  analysis: string
}
 
// Cambiar a false cuando el backend esté corriendo (H3)
const USE_MOCK = true
 
const signalStyles = {
  BUY:  { badge: "bg-green-100 text-green-800", emoji: "🚀" },
  SELL: { badge: "bg-red-100 text-red-800",     emoji: "🔴" },
  HOLD: { badge: "bg-gray-100 text-gray-800",   emoji: "⏸️" },
}
 
export function ChartUploader() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
 
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setResult(null)
    setPreview(URL.createObjectURL(file))
 
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1500))
      setResult(mockAnalyzeResponse)
      setLoading(false)
      return
    }
 
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1]
        const data = await analyzeChart(base64)
        setResult(data)
      } catch (err) {
        console.error(err)
        setResult(mockAnalyzeResponse)  // fallback a mock
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }
 
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Analizar Chart</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Chart" className="max-h-48 mx-auto rounded" />
          ) : (
            <p className="text-muted-foreground text-sm">
              Haz clic o arrastra un chart de TradingView
            </p>
          )}
        </div>
 
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
 
        <Button
          className="w-full"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          {loading ? "⏳ Analizando con IA..." : "📤 Subir chart"}
        </Button>
 
        {result && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Signal:</span>
              <Badge className={signalStyles[result.signal].badge}>
                {signalStyles[result.signal].emoji} {result.signal}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Patrón:</span>
              <span className="text-sm font-medium">{result.pattern}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-mono">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{result.analysis}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```
 
### components/SignalTable.tsx
 
```typescript
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Signal } from "@/lib/mock-data"
 
const EXPLORER = "https://testnet.monadexplorer.com/tx/"
 
function shortHash(h: string) {
  return `${h.slice(0, 8)}...${h.slice(-6)}`
}
function timeAgo(ts: number) {
  const d = Math.floor((Date.now() - ts) / 1000)
  if (d < 60) return `${d}s`
  if (d < 3600) return `${Math.floor(d/60)}m`
  return `${Math.floor(d/3600)}h`
}
 
export function SignalTable({ signals }: { signals: Signal[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Signal</TableHead>
          <TableHead>Confidence</TableHead>
          <TableHead>Patrón</TableHead>
          <TableHead>TX</TableHead>
          <TableHead>Hace</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {signals.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-bold">{s.token}</TableCell>
            <TableCell>
              <Badge variant={s.signal === "BUY" ? "default" : "destructive"}>
                {s.signal}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: `${s.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono">
                  {(s.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">{s.pattern}</TableCell>
            <TableCell>
              <a
                href={`${EXPLORER}${s.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-blue-600 hover:underline"
              >
                {shortHash(s.tx_hash)}
              </a>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">{timeAgo(s.timestamp)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```
 
---
 
## Paso 3 — Conectar backend real (H3)
 
Cuando el backend esté corriendo, en `ChartUploader.tsx`:
 
```typescript
const USE_MOCK = false   // ← cambiar esto
```
 
Si el backend da error de CORS: avisar al backend para agregar el origin del frontend en `main.py`.
 
---
 
## Prioridades visuales para el jurado
 
| Prioridad | Componente | Impacto en demo |
|-----------|-----------|-----------------|
| 🔴 Crítico | ChartUploader — imagen → signal visible | El momento wow |
| 🔴 Crítico | Badge BUY/SELL verde/rojo grande | Legible desde el proyector |
| 🔴 Crítico | Link a MonadVision que funcione | "Verificable on-chain" |
| 🟡 Importante | SignalTable con tx_hash | Historial de trades |
| 🟢 Opcional | Recharts con accuracy | Solo si sobra tiempo en H5 |
 
---
 
## Comandos rápidos (Windows)
 
```powershell
pnpm dev                          # desarrollo
pnpm build                        # verificar TypeScript antes de demo
pnpm dlx shadcn add <componente>  # agregar componente
pnpm add <paquete>                # agregar dependencia
```