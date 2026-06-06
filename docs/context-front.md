DOCUMENTO DE ACOPLAMIENTO FRONT-BACK: SIGNALAI TERMINAL
Dirigido a: Equipo de Ingeniería Backend y Desarrolladores de Contratos Inteligentes (Smart Contracts).
Contexto del Proyecto: SignalAI es un terminal de trading autónomo y asistido de alto rendimiento para la red Monad. Permite a los usuarios optimizar swaps analizando gráficos visuales de TradingView vía IA (Gemini Multimodal) de forma directa, ágil y con protección de colaterales integrada.
1. 🎛️ Modos de Ejecución Esperados (Frontend Logic)
El frontend ya maneja un estado dual para la toma de decisiones. El backend debe sincronizar estas dos lógicas a través de la API:
Modo AUTOPILOT (Totalmente Autónomo): El backend de IA escanea constantemente el mercado, detecta oportunidades y ejecuta de forma directa el swap llamando a los contratos en Monad si el nivel de confianza supera el umbral configurado por el perfil de riesgo.
Modo ASSISTED (Manual / Supervisado): El backend detecta la oportunidad, la almacena en un estado temporal de "Oportunidades Escaneadas" (ScannedOpportunity) y espera a que el usuario presione el endpoint de aprobación desde el frontend para gatillar la transacción física en la blockchain.
2. 🔌 Especificación de la API (REST / WebSockets)
Para acoplar el frontend actual, el backend debe exponer los siguientes endpoints bajo la ruta base de API (ej. /api/v1):
A. Análisis Multimodal de Gráficos
Endpoint: POST /api/analyze-chart
Content-Type: multipart/form-data
Payload de Entrada: Archivo de imagen (JPEG/PNG) correspondiente a la captura de TradingView.
Respuesta Esperada (JSON):
code
TypeScript
{
  "token": "MONAD",       // Token identificado (ej. 'MONAD', 'USDC', 'ETH')
  "signal": "BUY",        // Dirección ('BUY' | 'SELL' | 'HOLD')
  "confidence": 0.947,    // Nivel de confianza decimal (0 a 1)
  "pattern": "Morning Star Alcista", // Figura de velas identificada
  "price": 1.25,          // Precio actual de mercado
  "targetPrice": 1.38,    // Toma de ganancias (Take Profit)
  "stopLoss": 1.19,       // Freno de pérdidas (Stop Loss)
  "timeframe": "1H",      // Temporalidad detectada
  "indicators": ["RSI Oversold", "EMA 200 Support"],
  "explanation": "El gráfico muestra un patrón de reversión alcista clásico sobre el soporte clave..."
}
B. Sincronización del Estado del Agente
Endpoint: GET /api/agent/state
Respuesta Esperada (JSON):
code
TypeScript
{
  "riskProfile": "CONSERVATIVE", // ('CONSERVATIVE' | 'INTERMEDIATE' | 'RISKY')
  "executionMode": "AUTOPILOT",  // ('AUTOPILOT' | 'ASSISTED')
  "minCapitalLimit": 100.00,     // Margen de detención (Stop limit en balance)
  "currentBalance": 10582.40,    // Balance total actual (sincronizado con RPC)
  "startingBalance": 10000.00,   // Balance inicial
  "isOperating": true,           // Si el escáner del agente está activo
  "consecutiveLosses": 0
}
Endpoint: POST /api/agent/configure
Permite actualizar en caliente los límites de riesgo y el modo de operación.
C. Oportunidades Escaneadas (Solo para Modo ASSISTED)
Endpoint: GET /api/agent/opportunities
Devuelve la lista de operaciones pre-evaluadas que están pendientes de la firma o aprobación del usuario.
3. ⛓️ Requerimientos de Smart Contracts (Red Monad Devnet)
Para lograr la latencia sub-3s del simulador del frontend, se sugiere que los contratos estén estructurados de la siguiente manera:
A. Contrato Router de Ejecución (SignalRouter.sol)
Debe exponer una función optimizada para interactuar de forma atómica con el pool de liquidez correspondiente.
code
Solidity
interface ISignalRouter {
    enum SignalType { BUY, SELL, HOLD }

    struct TradeParams {
        address tokenAddress;
        SignalType signal;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 targetPrice;
        uint256 stopLoss;
    }

    // Ejecuta el swap atómico (frecuentemente llamado por la billetera del Agente)
    function executeSwap(TradeParams calldata params) external returns (bytes32 txHash);

    // Evento para rastrear transacciones en el Feed del Front
    event SwapExecuted(
        address indexed user,
        address indexed token,
        SignalType signal,
        uint256 amountIn,
        uint256 amountOut,
        uint256 indexed blockNumber,
        string patternName
    );
}
B. Flujo de Autenticación y Transacciones
Custodia del Agente (Opcional para Autopiloto total): Si el servidor de backend ejecuta automáticamente en modo AUTOPILOT, se recomienda instanciar una billetera caliente temporal (Hot Wallet) asociada a la cuenta del usuario en el servidor, firmar programáticamente las transacciones y enrutarlas directo al RPC de Monad.
Verificación de Explorador: Cada respuesta exitosa de swap efectuada on-chain debe retornar el respectivo txHash para que el frontend pueda construir el hipervínculo interactivo al visualizador (ej: https://testnet.monadvision.xyz/tx/0x...).
4. 📝 Modelo de Datos del Log para Audición criptográfica
Cada acción realizada por la IA (tanto análisis de riesgo, descarte de trades o swaps manuales) debe generar una entrada en la base de datos para alimentar el feed del frontend.
Esquema del Log (AgentLog):
id: Identificador único (UUID, String).
timestamp: En milisegundos Unix.
type: Categoría ("INFO" | "TRADE_OPEN" | "TRADE_CLOSE" | "RISK_ALERT" | "DECISION").
message: Descripción detallada traducida en lenguaje de operador humano (ej. "Estableciendo compra de 200 MONAD a precio de mercado de $1.25").
Con este prompt de especificación, el equipo de backend podrá construir las APIs gemelas usando NodeJS/Express, Python/FastAPI o Go, facilitando la conexión directa, la decodificación de ABIs y las suscripciones vía WebSocket para empujar los bloques de la red Monad al frontend en tiempo real.