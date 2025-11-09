import { Github } from "lucide-react";
import { SiX, SiDiscord } from "react-icons/si";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 mt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Zolana-Chan</h3>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Anonymous token swaps on Solana with zero-knowledge proofs and transaction mixing. 
              Inspired by Mert.
            </p>
            <div className="flex gap-2">
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
              <Button
                data-testid="link-discord"
                variant="ghost"
                size="icon"
                onClick={() => console.log("Discord clicked")}
              >
                <SiDiscord className="w-5 h-5" />
              </Button>
              <Button
                data-testid="link-github"
                variant="ghost"
                size="icon"
                onClick={() => console.log("GitHub clicked")}
              >
                <Github className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Resources</h4>
              <div className="space-y-2">
                <button
                  data-testid="link-docs"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  onClick={() => console.log("Documentation clicked")}
                >
                  Documentation
                </button>
                <button
                  data-testid="link-security"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  onClick={() => console.log("Security Audits clicked")}
                >
                  Security Audits
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Legal</h4>
              <div className="space-y-2">
                <button
                  data-testid="link-privacy"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  onClick={() => console.log("Privacy Policy clicked")}
                >
                  Privacy Policy
                </button>
                <button
                  data-testid="link-terms"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  onClick={() => console.log("Terms of Service clicked")}
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Zolana-Chan. All rights reserved. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
