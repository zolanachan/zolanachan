# Zolana-Chan - Privacy-Focused Solana Token Swapper

## Overview

Zolana-Chan is a privacy-focused decentralized exchange (DEX) built on Solana that enables anonymous token swaps from SOL to USDC. The application emphasizes user privacy through zero-knowledge proofs and transaction mixing, offering a clean, modern interface inspired by both traditional DEX platforms (Jupiter, Uniswap) and privacy-focused cryptocurrency applications (Monero, Zcash). The design follows Solana's vibrant brand identity with bold greens, blues, and purples on a dark background.

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
- Direct connection to Solana mainnet-beta via public RPC endpoint
- Phantom wallet integration for transaction signing
- Transaction construction with SystemProgram for token transfers
- Privacy service layer simulating transaction mixing and zero-knowledge proofs

**Privacy Features** (Simulated)
- Privacy score estimation based on transaction amount and privacy mode
- Simulated mixing pool routing with additional privacy fees
- Transaction delay simulation for mixing period (30-60 seconds)
- Mock privacy metrics displayed to users

**Wallet Management**
- Phantom wallet detection and connection handling
- Real-time balance updates (SOL)
- Wallet event listeners for connection state changes
- Transaction signing and submission through wallet provider

### Data Schema

**User Schema** (PostgreSQL via Drizzle)
- `users` table with UUID primary keys
- Username and password fields (foundation for future authentication)
- Zod schema validation for insert operations
- Type inference for compile-time safety

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
- **Solana Mainnet-beta**: Public RPC endpoint (`https://api.mainnet-beta.solana.com`) for blockchain interactions
- **Phantom Wallet**: Browser extension wallet provider for transaction signing and account management

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

### Future Integration Points
- Jupiter Aggregator API for actual swap execution
- Solana SPL Token program for USDC interactions
- Zero-knowledge proof libraries (placeholder for actual privacy implementation)
- Transaction mixing protocol integration