# Zolana-Chan - Privacy-Focused Solana Mixer

## Overview

Zolana-Chan is a privacy-focused cryptocurrency mixer built on Solana Devnet that enables anonymous SOL deposits and withdrawals through a commitment-based mixing pool. Users deposit SOL with a secret commitment, wait for an anonymity set to form, then withdraw to a different address to break on-chain linkage. The application uses real Phantom wallet integration and implements genuine privacy features including hash-based commitments, pooled deposits, time delays, and anonymity sets. The design follows Solana's vibrant brand identity with bold greens, blues, and purples on a dark background.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundation
- Shadcn/ui design system (New York style variant) for pre-composed, customizable components
- Tailwind CSS for utility-first styling with custom theme configuration
- CSS variables for dynamic theming supporting both light and dark modes
- Custom color system based on Solana's brand colors (Surge Green #00FFA3, Ocean Blue #03E1FF, Purple Dino #DC1FFF)

**Typography & Design**
- Space Grotesk font family for headings and UI elements (modern, technical aesthetic)
- JetBrains Mono for monospaced elements (addresses, amounts, transaction hashes)
- Design tokens defined in CSS custom properties for consistent spacing, shadows, and elevations
- Hover and active state effects for interactive elements

**State Management**
- React Context API for wallet connection state (`WalletContext`)
- TanStack Query (React Query) for server state management and caching
- Local component state with React hooks for UI interactions

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript
- ESM module system throughout the codebase
- Custom middleware for request logging with timing and JSON response capture
- Development and production build modes with appropriate optimizations

**API Design**
- RESTful API structure with `/api` prefix convention
- JSON request/response format
- Raw body buffering for signature verification use cases
- CORS and session handling ready (connect-pg-simple for sessions)

**Storage Layer**
- In-memory storage implementation (`MemStorage`) for development
- Storage interface pattern (`IStorage`) allowing easy swap to database implementations
- Drizzle ORM configured for PostgreSQL (via Neon serverless)
- Schema defined with Drizzle's type-safe query builder and Zod validation

### Blockchain Integration

**Solana Web3.js Integration**
- Direct connection to Solana Devnet via public RPC endpoint
- Phantom wallet integration for transaction signing
- Transaction construction with SystemProgram and Memo program
- Real privacy mixer implementation with custodial backend wallet

**Privacy Features** (Real Implementation)
- **Commitment Scheme**: SHA-256 hash of (secret + nullifier) using Web Crypto API
- **Pooled Deposits**: All deposits stored in backend mixer wallet
- **Anonymity Sets**: Minimum 3 deposits required before any withdrawal
- **Time Delays**: 10-minute minimum wait between deposit and withdrawal
- **Address Unlinking**: Withdrawals sent to different address than deposit
- **Front-running Protection**: Commitment binding via Solana Memo program
- **Atomic Operations**: Race condition guards prevent double-withdrawals
- **Fixed Amounts**: 0.1 SOL deposits for uniform anonymity set

**Security Features**
- **Signature Uniqueness**: Each transaction signature can only be used once
- **Deposit Validation**: Verifies actual lamport transfer on-chain
- **Memo Verification**: Ensures commitment is in signed transaction (prevents theft)
- **Transaction Confirmation**: Checks blockchain confirmation before crediting
- **Rollback Handling**: Database rollback on failed blockchain transactions

**Wallet Management**
- Phantom wallet detection and connection handling
- Real-time balance updates (SOL on Devnet)
- Wallet event listeners for connection state changes
- Transaction signing and submission through wallet provider
- Backend mixer wallet persisted via MIXER_WALLET_PRIVATE_KEY secret

### Data Schema

**Mixer Schema** (PostgreSQL via Drizzle)
- **mixer_deposits** table:
  - Tracks all deposits with commitment, nullifier, signature
  - Unique constraints on commitment, nullifier, and signature (prevents replays)
  - Timestamp for time-delay enforcement
  
- **mixer_withdrawals** table:
  - Tracks completed withdrawals with commitment reference
  - Foreign key to deposits table
  - Withdrawal signature and recipient address
  - Prevents double-withdrawal of same commitment
  
- **mixer_config** table:
  - Stores mixer parameters (deposit amount, delays, anonymity set size)
  - Backend mixer wallet public key
  
**Validation**
- Zod schema validation for all API requests
- Type-safe insert/select operations via Drizzle
- Runtime validation of commitments and nullifiers

**Design Patterns**
- Repository pattern with storage interface abstraction
- Context providers for cross-cutting concerns (wallet, theme)
- Compound component pattern for UI elements
- Controlled components with form validation

### Development Tooling

**Type Safety & Quality**
- TypeScript strict mode enabled across all modules
- Path-based module resolution with bundler strategy
- Shared types between client and server via `@shared` namespace
- ESLint-ready configuration structure

**Build Pipeline**
- Vite for client bundling with React plugin
- esbuild for server bundling (ESM output, external packages)
- Separate development and production configurations
- Source maps for debugging

**Development Experience**
- Replit-specific plugins for runtime error overlay and dev banner
- Hot module replacement in development
- Automatic server restart with tsx
- Drizzle Kit for database migrations and schema pushing

## External Dependencies

### Blockchain Services
- **Solana Devnet**: Public RPC endpoint (`https://api.devnet.solana.com`) for blockchain interactions
- **Phantom Wallet**: Browser extension wallet provider for transaction signing and account management
- **Solana Memo Program**: On-chain program for embedding commitment data (prevents front-running)

### Database
- **Neon Database**: Serverless PostgreSQL database accessed via `@neondatabase/serverless` driver
- Database URL configured through environment variable `DATABASE_URL`
- Drizzle ORM for type-safe database operations

### UI Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled component primitives
  - Dialog, Dropdown, Popover, Tooltip, Switch, Tabs, and 20+ other primitives
  - Full keyboard navigation and ARIA support
- **Shadcn/ui**: Pre-configured component collection built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets (SimpleIcons for social media)

### State & Data Management
- **TanStack Query v5**: Server state synchronization, caching, and background updates
- **React Hook Form**: Form state management with validation
- **Hookform Resolvers**: Integration layer for Zod schema validation
- **Zod**: Runtime type validation and schema definition

### Styling & Theming
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management for components
- **tailwind-merge**: Intelligent Tailwind class merging
- **clsx**: Conditional className composition

### Development Dependencies
- **Vite Plugins**: Runtime error modal, cartographer (Replit-specific), dev banner
- **TypeScript**: Type system and compiler
- **PostCSS & Autoprefixer**: CSS processing pipeline
- **Google Fonts**: Space Grotesk and JetBrains Mono via CDN

### Implementation Details

**Cryptography**
- Browser-compatible SHA-256 implementation via Web Crypto API
- Hex encoding for commitments and nullifiers
- Base58 encoding/decoding for Solana transaction data (bs58 library)

**Backend Mixer Wallet**
- Persistent Solana keypair stored in MIXER_WALLET_PRIVATE_KEY environment secret
- Base58-encoded private key array format
- All deposits pooled into this custodial wallet
- Withdrawals sent from this wallet to recipient addresses

**API Endpoints**
- `GET /api/mixer/status`: Pool status (anonymity set, delays, mixer address)
- `POST /api/mixer/deposit`: Register deposit after on-chain confirmation
- `POST /api/mixer/withdraw`: Process withdrawal with commitment verification

**Privacy Model**
- **Threat Model**: Prevents on-chain transaction graph analysis
- **Limitations**: Custodial (backend controls funds), not zero-knowledge
- **Anonymity Set**: Minimum 3 deposits provides k-anonymity
- **Time Delay**: 10 minutes prevents timing correlation attacks
- **Amount Uniformity**: Fixed 0.1 SOL deposits prevent amount-based correlation

### Future Enhancement Points
- Non-custodial implementation using smart contracts
- Zero-knowledge proofs (zk-SNARKs) for stronger privacy guarantees
- Merkle tree commitment verification for improved scalability
- Support for multiple deposit denominations
- SPL Token support (USDC, other tokens)