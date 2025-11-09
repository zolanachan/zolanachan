import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DevnetBanner() {
  return (
    <Alert className="border-primary/50 bg-primary/5">
      <InfoIcon className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary">Using Solana Devnet</AlertTitle>
      <AlertDescription className="text-sm space-y-2">
        <p className="text-muted-foreground">
          This app is currently connected to <strong>Solana Devnet</strong> for testing. 
          You'll need devnet SOL (free test tokens) to try swaps.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            data-testid="button-get-devnet-sol"
            size="sm"
            variant="outline"
            asChild
          >
            <a 
              href="https://faucet.solana.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              Get Free Devnet SOL <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
          <span className="text-xs text-muted-foreground">
            (Switch Phantom to Devnet in settings)
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
