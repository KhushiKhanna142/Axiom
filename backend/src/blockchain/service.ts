import { ethers } from 'ethers';
import CircuitBreaker from 'opossum';
import { AUDIT_LOG_ABI } from './abi';
import { env } from '../config/env';
import { logger } from '../lib/logger';

const provider = new ethers.JsonRpcProvider(env.POLYGON_RPC_URL);
const wallet = new ethers.Wallet(env.POLYGON_PRIVATE_KEY, provider);
export const contract = new ethers.Contract(env.POLYGON_CONTRACT_ADDRESS, AUDIT_LOG_ABI as any, wallet);

async function _write(eventType: string, actorId: string, targetId: string, meta: object): Promise<string> {
  const aHash = ethers.keccak256(ethers.toUtf8Bytes(actorId));
  const tHash = ethers.keccak256(ethers.toUtf8Bytes(targetId));
  const dHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(meta)));
  const tx = await (contract as any).logEvent(eventType, aHash, tHash, dHash);
  const receipt = await tx.wait();
  return receipt.hash as string;
}

const breaker = new CircuitBreaker(_write, {
  timeout: 15000,
  errorThresholdPercentage: 50,
  resetTimeout: 60000,
  volumeThreshold: 3,
});

breaker.on('open', () => logger.warn({ event: 'blockchain.circuit_open' }));
breaker.on('close', () => logger.info({ event: 'blockchain.circuit_closed' }));

export async function writeAuditEventToBlockchain(
  eventType: string, actorId: string, targetId: string, meta: object
): Promise<string | null> {
  try {
    return await breaker.fire(eventType, actorId, targetId, meta) as string;
  } catch {
    return null;
  }
}

export async function getAuditTrailFromChain(count = 20) {
  try {
    const total = Number(await (contract as any).getEventCount());
    const events = [];
    for (let i = Math.max(0, total - count); i < total; i++) {
      const e = await (contract as any).getEvent(i);
      events.push({
        index: i,
        eventType: e.eventType,
        timestamp: new Date(Number(e.timestamp) * 1000).toISOString(),
      });
    }
    return events;
  } catch {
    return [];
  }
}
