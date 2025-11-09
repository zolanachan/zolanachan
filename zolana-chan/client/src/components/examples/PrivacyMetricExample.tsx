import PrivacyMetric from '../PrivacyMetric';

export default function PrivacyMetricExample() {
  return (
    <div className="p-8 max-w-xs">
      <PrivacyMetric
        value="$2.4M"
        label="Total Volume Mixed"
        subtext="+15.3% this week"
        trend="up"
      />
    </div>
  );
}
