import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock, Settings, ChevronDown, ArrowDown, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { executePrivateSwap, getCurrentSOLPrice, estimatePrivacyScore } from "@/lib/privacyService";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function SwapCard() {
  const { connected, balance, publicKey, connect, addTransaction } = useWallet();
  const { toast } = useToast();
  
  const [solAmount, setSolAmount] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [maxPrivacy, setMaxPrivacy] = useState(true);
  const [slippage, setSlippage] = useState("1.0");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [solPrice, setSolPrice] = useState(45.32);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  useEffect(() => {
    getCurrentSOLPrice().then(setSolPrice);
  }, []);

  const privacyEstimate = solAmount 
    ? estimatePrivacyScore(parseFloat(solAmount), maxPrivacy)
    : null;

  const handleSwap = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Phantom wallet to continue",
        variant: "destructive",
      });
      connect();
      return;
    }

    if (!solAmount || parseFloat(solAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid SOL amount",
        variant: "destructive",
      });
      return;
    }

    if (balance && parseFloat(solAmount) > balance) {
      toast({
        title: "Insufficient balance",
        description: `You only have ${balance.toFixed(4)} SOL`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSwapping(true);

      toast({
        title: "🔒 Initiating private swap",
        description: maxPrivacy 
          ? "Your transaction will be mixed with others for maximum privacy"
          : "Processing swap transaction",
      });

      const phantomProvider = (window as any).solana;
      if (!phantomProvider?.isPhantom) {
        throw new Error("Phantom wallet not found");
      }

      const result = await executePrivateSwap(
        phantomProvider,
        parseFloat(solAmount),
        maxPrivacy,
        parseFloat(slippage)
      );

      setTxSignature(result.signature);

      addTransaction({
        signature: result.signature,
        timestamp: Date.now(),
        amount: parseFloat(solAmount),
        privacyMode: maxPrivacy,
        status: result.status,
        from: publicKey?.toBase58() || "",
        to: "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP",
      });
      
      toast({
        title: "✅ Swap submitted!",
        description: (
          <div className="space-y-2">
            <p>Your anonymous swap is processing</p>
            {maxPrivacy && (
              <p className="text-xs text-muted-foreground">
                🔒 Mixing with {privacyEstimate?.participants || 10}+ other transactions
              </p>
            )}
            <a 
              href={`https://solscan.io/tx/${result.signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View on Solscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ),
      });

      setSolAmount("");
      setUsdcAmount("");
      
    } catch (error: any) {
      console.error("Swap error:", error);
      toast({
        title: "❌ Swap failed",
        description: error.message || "Transaction was rejected or failed",
        variant: "destructive",
      });
    } finally {
      setSwapping(false);
    }
  };

  const handleSolAmountChange = (value: string) => {
    setSolAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const estimatedAmount = parseFloat(value) * solPrice;
      setUsdcAmount(estimatedAmount.toFixed(2));
    } else {
      setUsdcAmount("");
    }
  };

  return (
    <Card className="w-full max-w-md p-6 border-border">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">You send</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  data-testid="input-sol-amount"
                  type="text"
                  placeholder="0.00"
                  value={solAmount}
                  onChange={(e) => handleSolAmountChange(e.target.value)}
                  className="text-2xl font-mono h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                />
                <div className="flex items-center gap-2 h-12 px-4 rounded bg-muted">
                  <span className="font-semibold">SOL</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground font-mono">
                  {connected && balance !== null ? (
                    <>Balance: {balance.toFixed(4)} SOL</>
                  ) : (
                    <>Connect wallet to see balance</>
                  )}
                </div>
                {connected && balance !== null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-primary hover:text-primary/80"
                    onClick={() => handleSolAmountChange(balance.toString())}
                  >
                    MAX
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center py-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <ArrowDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">You receive (anonymous)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  data-testid="input-usdc-amount"
                  type="text"
                  placeholder="0.00"
                  value={usdcAmount}
                  readOnly
                  className="text-2xl font-mono h-14 border-0 border-b rounded-none px-0 bg-transparent focus-visible:ring-0"
                />
                <div className="flex items-center gap-2 h-12 px-4 rounded bg-muted">
                  <span className="font-semibold">USDC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded bg-muted border border-border">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <Label htmlFor="privacy-mode" className="text-sm font-medium cursor-pointer">
              Maximum Privacy Mode
            </Label>
          </div>
          <Switch
            id="privacy-mode"
            data-testid="switch-privacy-mode"
            checked={maxPrivacy}
            onCheckedChange={setMaxPrivacy}
          />
        </div>

        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              data-testid="button-settings-toggle"
              variant="ghost"
              className="w-full justify-between"
            >
              <span className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Transaction Settings
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="slippage" className="text-sm">Slippage Tolerance (%)</Label>
              <Input
                id="slippage"
                data-testid="input-slippage"
                type="text"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="font-mono"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {solAmount && privacyEstimate && (
          <div className="text-xs text-muted-foreground font-mono space-y-1">
            <div className="flex justify-between">
              <span>Rate:</span>
              <span>1 SOL ≈ {solPrice.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Network Fee:</span>
              <span>~0.000005 SOL</span>
            </div>
            <div className="flex justify-between">
              <span>Privacy Fee:</span>
              <span>0.1%</span>
            </div>
            {maxPrivacy && (
              <>
                <div className="flex justify-between pt-1 border-t border-border mt-2">
                  <span className="text-primary">Privacy Level:</span>
                  <span className="text-primary font-semibold">{privacyEstimate.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary">Mix Participants:</span>
                  <span className="text-primary">{privacyEstimate.participants}+</span>
                </div>
              </>
            )}
          </div>
        )}

        <Button
          data-testid="button-swap"
          className="w-full h-14 text-base font-semibold"
          onClick={handleSwap}
          disabled={swapping || !solAmount || parseFloat(solAmount) <= 0}
        >
          {swapping ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Swap...
            </>
          ) : !connected ? (
            "Connect Wallet to Swap"
          ) : (
            "Swap Anonymously"
          )}
        </Button>

        {txSignature && (
          <div className="flex items-center justify-center gap-2 text-xs text-primary">
            <CheckCircle2 className="w-4 h-4" />
            <a
              href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              View last transaction <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          {maxPrivacy 
            ? "🔒 Your transaction will be mixed with others for maximum privacy"
            : "Transaction will be executed directly on Solana"}
        </p>
      </div>
    </Card>
  );
}
