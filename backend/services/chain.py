from web3 import Web3
import os
from dotenv import load_dotenv
load_dotenv()

w3 = Web3(Web3.HTTPProvider(os.getenv("MONAD_RPC", "https://testnet.monad.xyz")))
private_key = os.getenv("WALLET_PRIVATE_KEY")
account = w3.eth.account.from_key(private_key) if private_key else None

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
    if account is None:
        raise ValueError("WALLET_PRIVATE_KEY no configurada")
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