// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AuditLog {
    struct AuditEvent {
        string eventType;
        address actor;
        bytes32 actorId;
        bytes32 targetId;
        bytes32 dataHash;
        uint256 timestamp;
    }

    AuditEvent[] public events;
    address public owner;

    event AuditEventLogged(
        uint256 indexed index,
        string eventType,
        address indexed actor,
        bytes32 actorId,
        bytes32 targetId,
        bytes32 dataHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function logEvent(
        string calldata eventType,
        bytes32 actorId,
        bytes32 targetId,
        bytes32 dataHash
    ) external onlyOwner {
        AuditEvent memory e = AuditEvent(
            eventType,
            msg.sender,
            actorId,
            targetId,
            dataHash,
            block.timestamp
        );
        events.push(e);
        emit AuditEventLogged(
            events.length - 1,
            eventType,
            msg.sender,
            actorId,
            targetId,
            dataHash,
            block.timestamp
        );
    }

    function getEvent(uint256 i) external view returns (AuditEvent memory) {
        require(i < events.length, "Index out of bounds");
        return events[i];
    }

    function getEventCount() external view returns (uint256) {
        return events.length;
    }
}
