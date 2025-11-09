import { Button } from "@/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

export default function WalletConnectButton() {
  const { connected, connecting, publicKey, balance, connect, disconnect } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  if (connecting) {
    return (
      <Button
        data-testid="button-connecting-wallet"
        variant="outline"
        className="gap-2"
        disabled
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (connected && publicKey) {
    return (
      <Button
        data-testid="button-disconnect-wallet"
        variant="outline"
        className="gap-2 font-mono"
        onClick={handleClick}
      >
        <Wallet className="w-4 h-4" />
        {formatAddress(publicKey.toBase58())}
        {balance !== null && (
          <span className="text-xs text-muted-foreground ml-1">
            ({balance.toFixed(2)} SOL)
          </span>
        )}
      </Button>
    );
  }

  return (
    <Button
      data-testid="button-connect-wallet"
      className="gap-2"
      onClick={handleClick}
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
}
