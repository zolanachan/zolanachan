import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, History as HistoryIcon, Trash2, Shield, ShieldOff, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import logoImage from "@assets/MAX (5)_1762679102272.png";
import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeToggle from "@/components/ThemeToggle";
import { SiX } from "react-icons/si";

export default function History() {
  const { transactionHistory, clearHistory } = useWallet();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatSignature = (signature: string) => {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/50 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Zolana-Chan" className="w-10 h-10 rounded-full" />
            <div>
              <h1 className="text-xl font-bold text-primary">Zolana-Chan</h1>
              <p className="text-[10px] text-muted-foreground">Inspired by Mert</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              data-testid="link-home"
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Swap
              </Link>
            </Button>
            <Button
              data-testid="link-twitter"
              variant="ghost"
              size="icon"
              asChild
            >
              <a href="https://x.com/zolanachansol" target="_blank" rel="noopener noreferrer">
                <SiX className="w-4 h-4" />
              </a>
            </Button>
            <ThemeToggle />
            <WalletConnectButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container max-w-5xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-history-title">
                <HistoryIcon className="w-8 h-8" />
                Transaction History
              </h1>
              <p className="text-muted-foreground mt-1" data-testid="text-history-subtitle">
                View all your submitted swaps on Solana Devnet
              </p>
            </div>
            {transactionHistory.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-clear-history">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Transaction History?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all transaction records from your local storage. This action cannot be undone.
                      Your transactions will still exist on the Solana blockchain.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearHistory} data-testid="button-confirm-clear">
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

      {transactionHistory.length === 0 ? (
        <Card className="border-dashed" data-testid="card-empty-state">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <HistoryIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Your transaction history will appear here once you complete your first swap.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactionHistory.map((tx, index) => (
            <Card key={tx.signature} data-testid={`card-transaction-${index}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg" data-testid={`text-amount-${index}`}>
                        {tx.amount.toFixed(4)} SOL
                      </CardTitle>
                      {tx.privacyMode ? (
                        <Badge variant="default" className="gap-1" data-testid={`badge-privacy-${index}`}>
                          <Shield className="w-3 h-3" />
                          Private
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1" data-testid={`badge-standard-${index}`}>
                          <ShieldOff className="w-3 h-3" />
                          Standard
                        </Badge>
                      )}
                      <Badge
                        variant={tx.status === "success" ? "default" : "secondary"}
                        data-testid={`badge-status-${index}`}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <CardDescription data-testid={`text-timestamp-${index}`}>
                      {formatTimestamp(tx.timestamp)}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a
                      href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-solscan-${index}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Solscan
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Signature:</span>
                    <code
                      className="px-2 py-1 bg-muted rounded text-xs font-mono"
                      data-testid={`text-signature-${index}`}
                    >
                      {formatSignature(tx.signature)}
                    </code>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">From:</span>
                    <code
                      className="px-2 py-1 bg-muted rounded text-xs font-mono"
                      data-testid={`text-from-${index}`}
                    >
                      {formatSignature(tx.from)}
                    </code>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">To:</span>
                    <code
                      className="px-2 py-1 bg-muted rounded text-xs font-mono"
                      data-testid={`text-to-${index}`}
                    >
                      {formatSignature(tx.to)}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
      </main>
    </div>
  );
}
