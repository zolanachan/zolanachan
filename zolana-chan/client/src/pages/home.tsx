import MixerCard from "@/components/MixerCard";
import FeatureCard from "@/components/FeatureCard";
import HowItWorksStep from "@/components/HowItWorksStep";
import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeToggle from "@/components/ThemeToggle";
import DevnetBanner from "@/components/DevnetBanner";
import { Button } from "@/components/ui/button";
import { Shield, Shuffle, UserX, Wallet, ArrowRightLeft, Lock, CheckCircle, History } from "lucide-react";
import { SiX } from "react-icons/si";
import logoImage from "@assets/MAX (5)_1762679102272.png";
import { Link } from "wouter";

export default function Home() {
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
              data-testid="link-history"
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href="/history">
                <History className="w-4 h-4 mr-2" />
                History
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
        <section className="px-4 py-24">
          <div className="max-w-7xl mx-auto w-full space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                Private SOL Mixer
              </h2>
              <p className="text-muted-foreground text-lg">
                Break transaction links with commitment-based mixing. Deposit from one address, withdraw to another.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <DevnetBanner />
            </div>
            
            <div className="flex justify-center">
              <MixerCard />
            </div>
          </div>
        </section>

        <section className="px-4 py-20 border-t border-border/50">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Commitment-based mixing with time delays and anonymity sets for enhanced privacy.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={Shield}
                title="Commitment Scheme"
                description="Generate a secret commitment when depositing. Only you can prove ownership later."
                metric="SHA-256"
              />
              <FeatureCard
                icon={Shuffle}
                title="Pooled Deposits"
                description="Your funds mix with others in the pool. Withdraw to a new address to break the link."
                metric="Active"
              />
              <FeatureCard
                icon={UserX}
                title="Time Delays"
                description="Enforced waiting periods and minimum anonymity sets prevent timing analysis."
                metric="10 min"
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-20 border-t border-border/50">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">Step by Step</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HowItWorksStep
                step={1}
                icon={Wallet}
                title="Deposit SOL"
                description="Connect your wallet and deposit the fixed amount. You'll receive a secret note - save it securely!"
              />
              <HowItWorksStep
                step={2}
                icon={Shuffle}
                title="Funds Mix in Pool"
                description="Your SOL joins the mixing pool with other deposits. Time delays and anonymity sets provide privacy."
              />
              <HowItWorksStep
                step={3}
                icon={Lock}
                title="Wait for Mixing"
                description="Minimum 10 minute delay. Pool needs at least 3 deposits before withdrawals are enabled."
              />
              <HowItWorksStep
                step={4}
                icon={CheckCircle}
                title="Withdraw Anonymously"
                description="Use your secret note to withdraw to a NEW address. The link between deposit and withdrawal is broken."
              />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
