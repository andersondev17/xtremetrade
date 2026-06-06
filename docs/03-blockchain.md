# SignalAI — Blockchain
 
> Stack: Hardhat · Solidity ^0.8.20 · web3.py · Monad testnet
> Quién lo hace: **backend** (tú), porque el contrato se integra con web3.py
> El frontend no toca contratos — solo usa el tx_hash como string para links
 
---
 
## División de responsabilidades
 
| Tarea | Quién | Por qué |
|-------|-------|---------|
| Escribir SignalVerifier.sol | Backend | Lo integra con web3.py |
| Compilar y deployar (Hardhat/JS) | Backend | Hardhat es Node, pero vive en carpeta separada |
| Leer CONTRACT_ADDRESS e integrarlo | Backend | Va al .env del backend |
| Mostrar tx_hash como link | Frontend | Solo string, sin web3 |
| Abrir MonadVision en la demo | Ambos | Para mostrar la tx on-chain |
 
---
 
## Estructura de archivos
 
```
signalai-contracts/          ← carpeta separada, no dentro del backend
├── .env                     ← WALLET_PRIVATE_KEY, nunca a git
├── .gitignore
├── hardhat.config.js
├── contracts/
│   └── SignalVerifier.sol
└── scripts/
    └── deploy.js
```
 
---
 
## Paso 1 — MetaMask + Monad testnet
 
### Configurar la red en MetaMask
 
1. Abrir MetaMask (extensión de Chrome/Firefox)
2. Clic en el selector de red (arriba, donde dice "Ethereum Mainnet")
3. Clic en **"Añadir red"** → **"Añadir red manualmente"**
4. Completar los campos:
| Campo | Valor |
|-------|-------|
| Nombre de red | `Monad Testnet` |
| URL de RPC | `https://testnet.monad.xyz` |
| ID de cadena | `10143` |
| Símbolo de moneda | `MON` |
| URL del explorador | `https://testnet.monadexplorer.com` |
 
5. Clic en **Guardar**
### Obtener tokens de testnet (faucet)
 
1. Copiar tu dirección de wallet de MetaMask (0x...)
2. Ir al faucet de Monad: buscar "Monad testnet faucet" — el oficial está en https://faucet.monad.xyz
3. Pegar la dirección y solicitar tokens
4. Esperar ~30 segundos. Verificar en MetaMask que tienes MON.
> Necesitas al menos 0.05 MON para deploy + varias transacciones de prueba.
 
### Exportar la private key para el .env
 
1. MetaMask → ícono de cuenta → **"Detalles de la cuenta"**
2. **"Mostrar clave privada"** → ingresar contraseña
3. Copiar la clave (empieza con `0x`)
4. Pegar en `.env` como `WALLET_PRIVATE_KEY=0x...`
> ⚠️ Esta wallet es de testnet. No mover fondos reales a esta dirección.
 
---
 
## Paso 2 — Setup Hardhat (Windows)
 
```powershell
mkdir signalai-contracts
cd signalai-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npx hardhat init
# Seleccionar: "Create a JavaScript project" → Enter en todo
```
 
### .gitignore para contracts
 
```
.env
node_modules/
artifacts/
cache/
```
 
### .env en signalai-contracts/
 
```env
WALLET_PRIVATE_KEY=0x...   ← la private key de MetaMask
```
 
---
 
## Paso 3 — hardhat.config.js
 
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
 
module.exports = {
  solidity: "0.8.20",
  networks: {
    monadTestnet: {
      url: "https://testnet.monad.xyz",
      chainId: 10143,
      accounts: [process.env.WALLET_PRIVATE_KEY],
    },
  },
};
```
 
---
 
## Paso 4 — contracts/SignalVerifier.sol
 
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
 
contract SignalVerifier {
    struct Signal {
        uint256 id;
        address trader;
        string token;
        string action;
        uint256 timestamp;
        uint256 confidence;   // basis points: 87% → 8700
        bytes32 txHash;
    }
 
    Signal[] public signals;
 
    event SignalRecorded(
        uint256 indexed id,
        address indexed trader,
        string token,
        string action,
        uint256 confidence
    );
 
    function recordSignal(
        string memory _token,
        string memory _action,
        uint256 _confidence,   // pasar 8700 para 87%
        bytes32 _txHash
    ) external returns (uint256) {
        require(_confidence <= 10000, "Max 100%");
 
        uint256 id = signals.length;
        signals.push(Signal({
            id: id,
            trader: msg.sender,
            token: _token,
            action: _action,
            timestamp: block.timestamp,
            confidence: _confidence,
            txHash: _txHash
        }));
 
        emit SignalRecorded(id, msg.sender, _token, _action, _confidence);
        return id;
    }
 
    function getSignalsCount() external view returns (uint256) {
        return signals.length;
    }
}
```
 
> `float` no existe en Solidity. Se usa `uint256` con basis points.
> En Python: `int(0.87 * 10000)` → `8700`
 
---
 
## Paso 5 — scripts/deploy.js
 
```javascript
const { ethers } = require("hardhat");
 
async function main() {
  console.log("Deploying SignalVerifier...");
 
  const SignalVerifier = await ethers.getContractFactory("SignalVerifier");
  const contract = await SignalVerifier.deploy();
  await contract.waitForDeployment();
 
  const address = await contract.getAddress();
  console.log("SignalVerifier deployed to:", address);
  console.log("Agregar al .env del backend: CONTRACT_ADDRESS=" + address);
}
 
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```
 
---
 
## Paso 6 — Compilar y deployar
 
```powershell
# Compilar (verificar que no hay errores — hacer ESTA NOCHE)
npx hardhat compile
 
# Deploy a Monad testnet
npx hardhat run scripts/deploy.js --network monadTestnet
```
 
Output esperado:
```
Deploying SignalVerifier...
SignalVerifier deployed to: 0xAbCd1234...
Agregar al .env del backend: CONTRACT_ADDRESS=0xAbCd1234...
```
 
Copiar esa address al `.env` del backend como `CONTRACT_ADDRESS=0xAbCd1234...`
 
Verificar el deploy en: https://testnet.monadexplorer.com/address/0xAbCd1234...
 
---
 
## Paso 7 — services/chain.py (backend Python)
 
Este archivo lo escribe el backend. Conecta web3.py con el contrato deployado.
 
```python
from web3 import Web3
import os
 
w3 = Web3(Web3.HTTPProvider(os.getenv("MONAD_RPC", "https://testnet.monad.xyz")))
private_key = os.getenv("WALLET_PRIVATE_KEY")
account = w3.eth.account.from_key(private_key)
 
# ABI mínimo — solo la función que usamos
ABI = [
    {
        "inputs": [
            {"name": "_token",      "type": "string"},
            {"name": "_action",     "type": "string"},
            {"name": "_confidence", "type": "uint256"},
            {"name": "_txHash",     "type": "bytes32"},
        ],
        "name": "recordSignal",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function",
    }
]
 
contract = w3.eth.contract(
    address=os.getenv("CONTRACT_ADDRESS"),
    abi=ABI
)
 
def record_signal(token: str, action: str, confidence_float: float, swap_tx_hash: str) -> str:
    """
    Registra un signal en Monad testnet.
    confidence_float: 0.87 → se convierte a 8700 (basis points)
    Retorna el tx_hash de la transacción en Monad.
    """
    confidence_bp = int(confidence_float * 10000)
 
    # bytes32 desde hex string
    raw = swap_tx_hash.replace("0x", "").ljust(64, "0")[:64]
    tx_hash_bytes = bytes.fromhex(raw)
 
    nonce = w3.eth.get_transaction_count(account.address)
    txn = contract.functions.recordSignal(
        token,
        action,
        confidence_bp,
        tx_hash_bytes,
    ).build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gas": 200_000,
        "gasPrice": w3.to_wei("1", "gwei"),
    })
 
    signed = account.sign_transaction(txn)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
 
    return receipt.transactionHash.hex()
```
 
**Probar la conexión:**
 
```powershell
uv run python -c "
from web3 import Web3
w3 = Web3(Web3.HTTPProvider('https://testnet.monad.xyz'))
print('Conectado:', w3.is_connected())
print('Block:', w3.eth.block_number)
"
```
 
---
 
## Flujo completo backend (integración)
 
```python
# En bot.py o en el endpoint /api/trade, después de analyze_chart:
 
from services.ai_analyzer import analyze_chart
from services.trade_executor import execute_trade
from services.chain import record_signal
 
async def handle_full_flow(image_bytes: bytes):
    # 1. Claude Haiku analiza el chart
    result = await analyze_chart(image_bytes)
 
    # 2. 0x Swap API ejecuta el trade
    swap_tx = await execute_trade(result["token"], result["signal"])
 
    # 3. Registrar en Monad testnet
    monad_tx = record_signal(
        token=result["token"],      # "ETH"
        action=result["signal"],    # "BUY"
        confidence_float=result["confidence"],  # 0.87
        swap_tx_hash=swap_tx,
    )
 
    return {**result, "tx_hash": monad_tx}
```
 
---
 
## Verificar en MonadVision
 
Después de cada `record_signal()`:
 
1. Copiar el `tx_hash` que retorna la función
2. Abrir: `https://testnet.monadexplorer.com/tx/{tx_hash}`
3. Verificar que el status es ✅ Success
Este es el momento de la demo: mostrar esta pantalla después de enviar el chart.