import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { generateMixerNote, noteToBase64, generateCommitment } from "@/lib/mixerClient";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Shield, Download, Upload, Copy, Check, Clock, Users, ExternalLink } from "lucide-react";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

interface MixerConfig {
  mixerAddress: string;
  minimumAnonymitySet: number;
  minimumDelayMinutes: number;
  fixedDepositAmount: number;
}

interface MixerStatus {
  anonymitySetSize: number;
  poolBalance: number;
  minimumAnonymitySet: number;
  minimumDelayMinutes: number;
  fixedDepositAmount: number;
}

export default function MixerCard() {
  const { publicKey, balance } = useWallet();
  const { toast} = useToast();
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [savedNote, setSavedNote] = useState<string>("");
  const [noteCopied, setNoteCopied] = useState(false);
  
  // Withdrawal form state
  const [withdrawSecret, setWithdrawSecret] = useState("");
  const [withdrawNullifier, setWithdrawNullifier] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  
  const walletAddress = publicKey?.toBase58() || null;

  // Fetch mixer config
  const { data: config } = useQuery<MixerConfig>({
    queryKey: ['/api/mixer/config'],
  });

  // Fetch mixer status
  const { data: status } = useQuery<MixerStatus>({
    queryKey: ['/api/mixer/status'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const handleDeposit = async () => {
    if (!walletAddress || !config) return;

    try {
      setIsDepositing(true);

      // Generate mixer note (secret + nullifier + commitment)
      const note = await generateMixerNote(config.fixedDepositAmount);
      
      // Create transaction to mixer address with commitment in memo (prevents front-running)
      const memoText = `ZOLANA:${note.commitment}`;
      const encoder = new TextEncoder();
      const memoData = encoder.encode(memoText);
      
      const transaction = new Transaction().add(
        // Add memo instruction with commitment
        {
          keys: [],
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
          data: memoData,
        },
        // Add transfer instruction
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: new PublicKey(config.mixerAddress),
          lamports: config.fixedDepositAmount,
        })
      );

      // Sign and send transaction
      const { solana } = window as any;
      const signed = await solana.signAndSendTransaction(transaction);
      const signature = signed.signature;

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      // Submit deposit to backend
      await apiRequest<any>("/api/mixer/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commitment: note.commitment,
          amount: config.fixedDepositAmount,
          depositAddress: walletAddress,
          depositSignature: signature,
        }),
      });

      // Save note for user
      const noteString = noteToBase64(note);
      setSavedNote(noteString);

      toast({
        title: "Deposit Successful!",
        description: "Save your secret note below to withdraw later.",
      });

      // Refetch status
      queryClient.invalidateQueries({ queryKey: ['/api/mixer/status'] });
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to deposit to mixer",
        variant: "destructive",
      });
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawSecret || !withdrawNullifier || !recipientAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsWithdrawing(true);

      // Verify the commitment
      const commitment = await generateCommitment(withdrawSecret, withdrawNullifier);

      // Submit withdrawal request
      const data = await apiRequest<any>("/api/mixer/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: withdrawSecret,
          nullifier: withdrawNullifier,
          recipientAddress,
        }),
      });

      toast({
        title: "Withdrawal Successful!",
        description: `${data.amount / LAMPORTS_PER_SOL} SOL sent to ${recipientAddress.slice(0, 8)}...`,
      });

      // Clear form
      setWithdrawSecret("");
      setWithdrawNullifier("");
      setRecipientAddress("");

      // Refetch status
      queryClient.invalidateQueries({ queryKey: ['/api/mixer/status'] });
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      
      let errorMessage = error.message || "Failed to withdraw from mixer";
      
      // Handle specific error cases
      if (error.message?.includes("anonymity set")) {
        errorMessage = `Need more deposits in pool. Currently ${status?.anonymitySetSize || 0}/${status?.minimumAnonymitySet || 3}`;
      } else if (error.message?.includes("time delay")) {
        errorMessage = "Minimum time delay not met. Please wait longer before withdrawing.";
      }
      
      toast({
        title: "Withdrawal Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const copyNote = () => {
    if (savedNote) {
      navigator.clipboard.writeText(savedNote);
      setNoteCopied(true);
      setTimeout(() => setNoteCopied(false), 2000);
      
      toast({
        title: "Note Copied!",
        description: "Keep this safe - you'll need it to withdraw",
      });
    }
  };

  const depositAmount = config ? config.fixedDepositAmount / LAMPORTS_PER_SOL : 1;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacy Mixer
            </CardTitle>
            <CardDescription>
              Fixed amount: {depositAmount} SOL • Break transaction links
            </CardDescription>
          </div>
          
          {status && (
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <Users className="w-3 h-3" />
                {status.anonymitySetSize}/{status.minimumAnonymitySet}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {status.minimumDelayMinutes}m
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" data-testid="tab-deposit">
              <Download className="w-4 h-4 mr-2" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" data-testid="tab-withdraw">
              <Upload className="w-4 h-4 mr-2" />
              Withdraw
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="space-y-4">
            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                Deposit exactly <strong>{depositAmount} SOL</strong> to the mixer pool. You'll receive a secret note to withdraw later from a different address.
              </AlertDescription>
            </Alert>
            
            {status && status.anonymitySetSize >= status.minimumAnonymitySet ? (
              <Alert>
                <Users className="w-4 h-4" />
                <AlertDescription>
                  <strong>Pool ready!</strong> {status.anonymitySetSize} deposits in pool. Withdrawals enabled.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Users className="w-4 h-4" />
                <AlertDescription>
                  Pool status: {status?.anonymitySetSize || 0}/{status?.minimumAnonymitySet || 3} deposits. Need {(status?.minimumAnonymitySet || 3) - (status?.anonymitySetSize || 0)} more for withdrawals.
                </AlertDescription>
              </Alert>
            )}
            
            {savedNote && (
              <div className="space-y-2">
                <Label>Your Secret Note (SAVE THIS!)</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={savedNote}
                    readOnly
                    rows={3}
                    className="font-mono text-xs"
                    data-testid="textarea-secret-note"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyNote}
                    data-testid="button-copy-note"
                  >
                    {noteCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Save this note securely! You'll need it to withdraw your SOL later.
                </p>
              </div>
            )}
            
            <Button
              onClick={handleDeposit}
              disabled={!walletAddress || isDepositing || !config}
              className="w-full"
              size="lg"
              data-testid="button-deposit"
            >
              {isDepositing ? "Depositing..." : `Deposit ${depositAmount} SOL to Mixer`}
            </Button>
            
            {!walletAddress && (
              <p className="text-sm text-muted-foreground text-center">
                Connect your wallet to deposit
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-4">
            <Alert>
              <Upload className="w-4 h-4" />
              <AlertDescription>
                Enter your secret note and withdrawal address. Your SOL will be sent after the minimum delay period.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="secret">Secret (hex)</Label>
              <Input
                id="secret"
                value={withdrawSecret}
                onChange={(e) => setWithdrawSecret(e.target.value)}
                placeholder="64-character hex string from your note"
                className="font-mono text-xs"
                data-testid="input-withdraw-secret"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nullifier">Nullifier (hex)</Label>
              <Input
                id="nullifier"
                value={withdrawNullifier}
                onChange={(e) => setWithdrawNullifier(e.target.value)}
                placeholder="64-character hex string from your note"
                className="font-mono text-xs"
                data-testid="input-withdraw-nullifier"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipient">Withdrawal Address (NEW address for privacy)</Label>
              <Input
                id="recipient"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="New Solana wallet address"
                data-testid="input-recipient-address"
              />
            </div>
            
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawSecret || !withdrawNullifier || !recipientAddress}
              className="w-full"
              size="lg"
              data-testid="button-withdraw"
            >
              {isWithdrawing ? "Withdrawing..." : `Withdraw ${depositAmount} SOL`}
            </Button>
            
            {status && (
              <p className="text-xs text-muted-foreground text-center">
                Minimum delay: {status.minimumDelayMinutes} minutes • Anonymity set: {status.anonymitySetSize}/{status.minimumAnonymitySet}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
