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