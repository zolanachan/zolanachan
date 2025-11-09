import HowItWorksStep from '../HowItWorksStep';
import { Wallet } from 'lucide-react';

export default function HowItWorksStepExample() {
  return (
    <div className="p-8 max-w-md">
      <HowItWorksStep
        step={1}
        icon={Wallet}
        title="Connect Your Wallet"
        description="Connect your Solana wallet securely. We support Phantom, Solflare, and other popular wallets."
      />
    </div>
  );
}
