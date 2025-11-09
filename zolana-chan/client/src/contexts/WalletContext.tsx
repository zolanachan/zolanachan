import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
  publicKey?: PublicKey;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
}

export interface TransactionHistory {
  signature: string;
  timestamp: number;
  amount: number;
  privacyMode: boolean;
  status: "success" | "pending" | "failed";
  from: string;
  to: string;
}

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  balance: number | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (transaction: Transaction) => Promise<string>;
  transactionHistory: TransactionHistory[];
  addTransaction: (tx: TransactionHistory) => void;
  clearHistory: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const SOLANA_NETWORK = "https://api.devnet.solana.com";
const connection = new Connection(SOLANA_NETWORK, "confirmed");

const HISTORY_STORAGE_KEY = "zolana-transaction-history";

const loadHistoryFromStorage = (): TransactionHistory[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading transaction history:", error);
    return [];
  }
};

const saveHistoryToStorage = (history: TransactionHistory[]) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving transaction history:", error);
  }
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>(() => 
    loadHistoryFromStorage()
  );

  const getProvider = (): PhantomProvider | undefined => {
    if ("solana" in window) {
      const provider = (window as any).solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    return undefined;
  };

  const updateBalance = async (pubKey: PublicKey) => {
    try {
      const bal = await connection.getBalance(pubKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error: any) {
      console.error("Error fetching balance:", error?.message || error);
      setBalance(0);
    }
  };

  const connect = async () => {
    const provider = getProvider();
    if (!provider) {
      window.open("https://phantom.app/", "_blank");
      return;
    }

    try {
      setConnecting(true);
      const resp = await provider.connect();
      setPublicKey(resp.publicKey);
      setConnected(true);
      await updateBalance(resp.publicKey);
    } catch (error) {
      console.error("Error connecting to Phantom:", error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    const provider = getProvider();
    if (provider) {
      try {
        await provider.disconnect();
        setConnected(false);
        setPublicKey(null);
        setBalance(null);
      } catch (error) {
        console.error("Error disconnecting:", error);
      }
    }
  };

  const sendTransaction = async (transaction: Transaction): Promise<string> => {
    const provider = getProvider();
    if (!provider || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      const { signature } = await provider.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature, "confirmed");
      await updateBalance(publicKey);
      return signature;
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    }
  };

  const addTransaction = (tx: TransactionHistory) => {
    setTransactionHistory((prev) => {
      const updated = [tx, ...prev];
      saveHistoryToStorage(updated);
      return updated;
    });
  };

  const clearHistory = () => {
    setTransactionHistory([]);
    saveHistoryToStorage([]);
  };

  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      const handleAccountChanged = (pubKey: PublicKey | null) => {
        if (pubKey) {
          setPublicKey(pubKey);
          setConnected(true);
          updateBalance(pubKey);
        } else {
          setConnected(false);
          setPublicKey(null);
          setBalance(null);
        }
      };

      provider.on("accountChanged", handleAccountChanged);
      
      if (provider.publicKey) {
        handleAccountChanged(provider.publicKey);
      }

      return () => {
        provider.off("accountChanged", handleAccountChanged);
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        publicKey,
        balance,
        connect,
        disconnect,
        sendTransaction,
        transactionHistory,
        addTransaction,
        clearHistory,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
