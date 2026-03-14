export const AUDIT_LOG_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [{"internalType":"uint256","name":"i","type":"uint256"}],
    "name": "getEvent", "outputs": [{"components": [
      {"internalType":"string","name":"eventType","type":"string"},
      {"internalType":"address","name":"actor","type":"address"},
      {"internalType":"bytes32","name":"actorId","type":"bytes32"},
      {"internalType":"bytes32","name":"targetId","type":"bytes32"},
      {"internalType":"bytes32","name":"dataHash","type":"bytes32"},
      {"internalType":"uint256","name":"timestamp","type":"uint256"}
    ],"internalType":"struct AuditLog.AuditEvent","name":"","type":"tuple"}],
    "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getEventCount",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType":"string","name":"eventType","type":"string"},
      {"internalType":"bytes32","name":"actorId","type":"bytes32"},
      {"internalType":"bytes32","name":"targetId","type":"bytes32"},
      {"internalType":"bytes32","name":"dataHash","type":"bytes32"}],
    "name": "logEvent", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
] as const;
