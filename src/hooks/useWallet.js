import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export function useWallet() {
  const [address, setAddress]     = useState(null);
  const [provider, setProvider]   = useState(null);
  const [signer, setSigner]       = useState(null);
  const [chainId, setChainId]     = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError]         = useState(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('No wallet detected. Please install MetaMask.');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await _provider.send('eth_requestAccounts', []);
      const _signer  = await _provider.getSigner();
      const _address = await _signer.getAddress();
      const network  = await _provider.getNetwork();
      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address);
      setChainId(Number(network.chainId));
    } catch (e) {
      setError(e.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  }, []);

  // Auto-reconnect if already approved
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) connect();
    });
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) disconnect();
      else connect();
    });
    window.ethereum.on('chainChanged', () => connect());
    return () => {
      window.ethereum?.removeAllListeners?.('accountsChanged');
      window.ethereum?.removeAllListeners?.('chainChanged');
    };
  }, []);

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  return { address, shortAddress, provider, signer, chainId, connecting, error, connect, disconnect };
}
