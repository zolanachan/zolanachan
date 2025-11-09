import SwapCard from "@/components/SwapCard";
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
                Anonymous SOL → USDC
              </h2>
              <p className="text-muted-foreground text-lg">
                Swap Solana for USDC anonymously with zero-knowledge proofs. No KYC. No tracking.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <DevnetBanner />
            </div>
            
            <div className="flex justify-center">
              <SwapCard />
            </div>
          </div>
        </section>

        <section className="px-4 py-20 border-t border-border/50">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">Privacy Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built with cryptographic protocols to keep your transactions private.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={Shield}
                title="Zero-Knowledge Proofs"
                description="Transactions verified without revealing sensitive information using advanced cryptography."
                metric="256-bit"
              />
              <FeatureCard
                icon={Shuffle}
                title="Transaction Mixing"
                description="Mix your transactions with others to break on-chain analysis and ensure anonymity."
                metric="Active"
              />
              <FeatureCard
                icon={UserX}
                title="No KYC Required"
                description="No identity verification, no personal data collection, no tracking."
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-20 border-t border-border/50">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">How It Works</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HowItWorksStep
                step={1}
                icon={Wallet}
                title="Connect Your Wallet"
                description="Connect your Solana wallet securely. We support Phantom, Solflare, and other popular wallets."
              />
              <HowItWorksStep
                step={2}
                icon={ArrowRightLeft}
                title="Select Tokens & Amount"
                description="Choose which tokens to swap and enter the amount. Enable Maximum Privacy Mode for enhanced features."
              />
              <HowItWorksStep
                step={3}
                icon={Lock}
                title="Execute Private Swap"
                description="Your transaction is encrypted, mixed with others, and executed through privacy pools on Solana."
              />
              <HowItWorksStep
                step={4}
                icon={CheckCircle}
                title="Complete & Verify"
                description="Receive your tokens instantly. Transaction details are encrypted and viewable only by you."
              />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
