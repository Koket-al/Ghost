import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { GHOST_ROOM_ABI, GHOST_ROOM_ADDRESS } from '../abi/GhostRoom';

function getContract(signerOrProvider) {
  return new ethers.Contract(GHOST_ROOM_ADDRESS, GHOST_ROOM_ABI, signerOrProvider);
}

export function useGhostRoom(signer, provider) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const clearError = () => setError(null);

  const createRoom = useCallback(async (name, durationSeconds) => {
    if (!signer) return;
    setLoading(true); setError(null);
    try {
      const contract = getContract(signer);
      const tx = await contract.createRoom(name, BigInt(durationSeconds));
      const receipt = await tx.wait();
      // Extract room ID from event
      const event = receipt.logs
        .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
        .find(e => e?.name === 'RoomCreated');
      return event ? Number(event.args.roomId) : null;
    } catch (e) {
      setError(parseError(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const joinRoom = useCallback(async (roomId) => {
    if (!signer) return false;
    setLoading(true); setError(null);
    try {
      const contract = getContract(signer);
      const tx = await contract.joinRoom(BigInt(roomId));
      await tx.wait();
      return true;
    } catch (e) {
      setError(parseError(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const sendMessage = useCallback(async (roomId, content) => {
    if (!signer) return false;
    setLoading(true); setError(null);
    try {
      const contract = getContract(signer);
      const tx = await contract.sendMessage(BigInt(roomId), content);
      await tx.wait();
      return true;
    } catch (e) {
      setError(parseError(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const destroyRoom = useCallback(async (roomId) => {
    if (!signer) return false;
    setLoading(true); setError(null);
    try {
      const contract = getContract(signer);
      const tx = await contract.destroyRoom(BigInt(roomId));
      await tx.wait();
      return true;
    } catch (e) {
      setError(parseError(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const getRoom = useCallback(async (roomId) => {
    const p = provider || (signer ? await signer.provider : null);
    if (!p) return null;
    try {
      const contract = getContract(p);
      const r = await contract.getRoom(BigInt(roomId));
      return {
        id:               Number(r.id),
        creator:          r.creator,
        name:             r.name,
        expiresAt:        Number(r.expiresAt),
        destroyed:        r.destroyed,
        isLive:           r.isLive,
        participantCount: Number(r.participantCount),
        messageCount:     Number(r.messageCount),
        secondsRemaining: Number(r.secondsRemaining),
      };
    } catch { return null; }
  }, [provider, signer]);

  const getMessages = useCallback(async (roomId) => {
    const p = provider || (signer ? await signer.provider : null);
    if (!p) return [];
    try {
      const contract = getContract(p);
      const msgs = await contract.getMessages(BigInt(roomId));
      return msgs.map(m => ({
        sender:    m.sender,
        content:   m.content,
        timestamp: Number(m.timestamp),
      }));
    } catch { return []; }
  }, [provider, signer]);

  const getUserRooms = useCallback(async (address) => {
    const p = provider || (signer ? await signer.provider : null);
    if (!p) return [];
    try {
      const contract = getContract(p);
      const ids = await contract.getUserRooms(address);
      return ids.map(Number);
    } catch { return []; }
  }, [provider, signer]);

  const checkIsParticipant = useCallback(async (roomId, address) => {
    const p = provider || (signer ? await signer.provider : null);
    if (!p) return false;
    try {
      const contract = getContract(p);
      return await contract.isParticipant(BigInt(roomId), address);
    } catch { return false; }
  }, [provider, signer]);

  return {
    loading, error, clearError,
    createRoom, joinRoom, sendMessage, destroyRoom,
    getRoom, getMessages, getUserRooms, checkIsParticipant,
  };
}

function parseError(e) {
  if (e?.reason) return e.reason;
  if (e?.message?.includes('user rejected')) return 'Transaction rejected.';
  if (e?.message?.includes('RoomAlreadyDestroyed')) return 'This room has been destroyed.';
  if (e?.message?.includes('RoomExpired')) return 'This room has expired.';
  if (e?.message?.includes('NotAParticipant')) return 'You are not a participant.';
  if (e?.message?.includes('AlreadyAParticipant')) return 'You already joined this room.';
  if (e?.message?.includes('RoomNotExpiredYet')) return 'Room has not expired yet.';
  return e?.message || 'Unknown error';
}
