# Design Guidelines: Zolana - Privacy-Focused Solana Token Swapper

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern DEX interfaces (Jupiter, Uniswap) combined with privacy-focused cryptocurrency applications (Monero, Zcash) and Solana's vibrant brand identity. The design emphasizes trust, security, and technical sophistication while maintaining exceptional usability with bold, energetic colors.

**Core Principles**:
- Bold Solana colorway - vibrant greens, blues, and purples on dark background
- Dark-themed interface conveying privacy and discretion with electric accents
- Strong visual hierarchy emphasizing the swap action
- Privacy indicators with neon-like glow effects
- Professional yet energetic, trustworthy presentation with modern crypto aesthetics

## Color System

**Primary Brand Colors** (Solana Official):
- Surge Green: #00FFA3 - Primary actions, success states, privacy indicators
- Ocean Blue: #03E1FF - Secondary accents, information, links
- Purple Dino: #DC1FFF - Tertiary accents, highlights, special features
- Black: #000000 - Primary background

**Usage**:
- Primary CTA buttons: Surge Green gradient to Ocean Blue
- Privacy mode indicators: Surge Green with glow
- Success states: Surge Green
- Links and secondary actions: Ocean Blue
- Special badges/features: Purple Dino
- Background: Pure black with subtle gradients

## Typography System

**Font Stack**: 
- Primary: 'Inter' or 'Space Grotesk' for modern, technical feel
- Monospace: 'JetBrains Mono' or 'IBM Plex Mono' for addresses, amounts, transaction hashes

**Hierarchy**:
- Hero/Main headings: text-4xl to text-5xl, font-bold
- Section headings: text-2xl to text-3xl, font-semibold  
- Card titles: text-lg, font-medium
- Body text: text-base, font-normal
- Labels/metadata: text-sm, font-medium
- Token amounts: text-2xl to text-3xl, font-semibold, monospace
- Addresses/hashes: text-xs to text-sm, monospace

## Layout System

**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Micro spacing (within components): gap-2, p-4
- Component internal padding: p-6, p-8
- Section spacing: py-12, py-16, py-24
- Container gaps: gap-6, gap-8

**Container Strategy**:
- Main container: max-w-7xl mx-auto px-4
- Swap interface: max-w-md centered (most focused element)
- Feature sections: max-w-6xl with grid layouts

## Page Structure

### Hero Section (50vh minimum)
Centered swap interface as the hero element - no traditional banner. The swap card IS the hero, positioned prominently with ample breathing room above and below.

**Components**:
- Wallet connection button (top-right)
- Centered swap card (max-w-md)
- Subtle privacy badge/indicator below swap card
- Brief tagline above card: "Anonymous Token Swaps on Solana"

### Swap Interface (Primary Component)
Generous padding (p-8), rounded-2xl, backdrop-blur treatment

**Structure**:
- Token input field (top): Large numeric input with token selector dropdown
- Swap direction icon (center): Clickable reverse button with rotation animation
- Token output field (bottom): Display-only with token selector
- Privacy toggle: Checkbox with "Maximum Privacy Mode" label
- Rate display: Small text showing exchange rate and fees
- Swap button: Full-width, large (h-14), prominent with loading states
- Transaction settings: Slippage, gas customization in expandable panel

### Features Section (Below Hero)
3-column grid on desktop (grid-cols-1 md:grid-cols-3), gap-8

**Feature Cards** (each):
- Icon placeholder (size-12, centered or left-aligned)
- Title: text-xl, font-semibold
- Description: text-sm, leading-relaxed
- Optional: Privacy metric or badge

**Suggested Features**:
1. Zero-Knowledge Proofs - Cryptographic privacy
2. Mixing Protocol - Transaction obfuscation
3. No KYC Required - True anonymity

### How It Works Section
Numbered step cards, 2-column grid on desktop (md:grid-cols-2), gap-6

**Step Components**:
- Large step number (text-4xl, opacity-20)
- Step title: text-lg, font-semibold
- Description: text-sm
- Visual indicator or icon

### Privacy Metrics Dashboard
Full-width section with stats grid (grid-cols-2 md:grid-cols-4)

**Metric Cards**:
- Large number: text-3xl, font-bold, monospace
- Label: text-sm, opacity-70
- Subtext: Change indicator or additional context

**Suggested Metrics**:
- Total Volume Mixed
- Active Privacy Pools
- Average Mix Participants
- Encryption Strength

### Transaction History (Optional Authenticated View)
List/table layout with minimal tracking info

**Columns**:
- Transaction ID (truncated, monospace)
- Tokens swapped (from → to)
- Amount (monospace)
- Status badge
- Time (relative, e.g., "2 hours ago")

### Footer Section
2-column layout (md:flex justify-between)

**Left Column**:
- Logo/brand
- Brief description (1-2 lines)
- Social links (privacy-focused: Telegram, Discord, Twitter)

**Right Column**:
- Documentation link
- Privacy Policy
- Terms of Service
- Security Audits link

## Component Library

### Buttons
- Primary (Swap): Large (h-14), full-width, rounded-xl, font-semibold
- Secondary (Settings): Medium (h-10), rounded-lg
- Icon buttons: Square (w-10 h-10), rounded-lg
- Wallet connect: Rounded-full with wallet icon, positioned top-right

### Input Fields
- Token inputs: Borderless with bottom border only, large text (text-2xl), monospace for amounts
- Search/filter: Rounded-lg, with search icon prefix
- Settings inputs: Standard height (h-12), rounded-lg

### Cards
- Main swap card: Generous padding (p-8), rounded-2xl, backdrop-blur
- Feature cards: Medium padding (p-6), rounded-xl
- Stat cards: Compact padding (p-4 to p-6), rounded-lg

### Modals/Dropdowns
- Token selector: Modal overlay with search + scrollable token list
- Settings panel: Slide-out drawer or expandable accordion
- Transaction confirmation: Centered modal with transaction details

### Privacy Indicators
- Lock icon with status text
- Progress bar for privacy level
- Badge components for encryption status

## Responsive Behavior

**Mobile (< 768px)**:
- Single column layouts throughout
- Swap card: Full-width minus padding (px-4)
- Reduced font sizes (scale down by 1 step)
- Collapsible sections for transaction history
- Bottom-sheet modals instead of centered

**Desktop (≥ 768px)**:
- Multi-column grids as specified
- Floating swap card with max-w-md
- Sticky wallet connection in header
- Side-by-side comparisons for features

## Animations
Use very sparingly - only for essential feedback:
- Token swap direction flip: Smooth 180° rotation
- Button loading states: Subtle pulse or spinner
- Modal entrances: Fade in with slight scale (0.95 to 1)
- Success confirmation: Checkmark animation
**No**: Scroll animations, parallax, decorative movements

## Images
**No hero image required** - the swap interface serves as the visual anchor. Privacy-focused applications benefit from minimal imagery to emphasize security and technical precision.

## Accessibility
- Maintain WCAG AA contrast ratios throughout
- All interactive elements keyboard navigable
- Focus states clearly visible with ring utilities
- Screen reader labels for all icons and status indicators
- Error states with clear messaging for failed transactions