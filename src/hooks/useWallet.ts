'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

// Monad Testnet Configuration
const MONAD_CHAIN_ID = '0x279F' // 9999 in hex
const MONAD_NETWORK = {
  chainId: MONAD_CHAIN_ID,
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.ankr.com/monad_testnet'],
  blockExplorerUrls: ['https://explorer.testnet.monad.xyz'],
}

export interface WalletState {
  address: string | null
  chainId: string | null
  isConnecting: boolean
  error: string | null
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
  })

  const checkIfWalletIsConnected = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      })
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      })

      if (accounts.length > 0) {
        setWalletState((prev) => ({
          ...prev,
          address: accounts[0],
          chainId,
        }))
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    }
  }, [])

  const switchToMonadNetwork = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_CHAIN_ID }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_NETWORK],
          })
        } catch (addError) {
          throw new Error('Failed to add Monad network')
        }
      } else {
        throw switchError
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setWalletState((prev) => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to use this feature.',
      }))
      return
    }

    setWalletState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }))

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      // Switch to Monad network
      await switchToMonadNetwork()

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      })

      setWalletState({
        address: accounts[0],
        chainId,
        isConnecting: false,
        error: null,
      })
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      setWalletState({
        address: null,
        chainId: null,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      })
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      address: null,
      chainId: null,
      isConnecting: false,
      error: null,
    })
  }

  useEffect(() => {
    checkIfWalletIsConnected()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletState((prev) => ({
            ...prev,
            address: accounts[0],
          }))
        } else {
          disconnectWallet()
        }
      })

      window.ethereum.on('chainChanged', (chainId: string) => {
        setWalletState((prev) => ({
          ...prev,
          chainId,
        }))
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [checkIfWalletIsConnected])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    isConnected: !!walletState.address,
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
