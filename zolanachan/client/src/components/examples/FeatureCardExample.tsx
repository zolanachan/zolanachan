import FeatureCard from '../FeatureCard';
import { Shield } from 'lucide-react';

export default function FeatureCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <FeatureCard
        icon={Shield}
        title="Zero-Knowledge Proofs"
        description="Your transactions are verified without revealing any sensitive information using advanced cryptographic protocols."
        metric="256-bit"
      />
    </div>
  );
}
