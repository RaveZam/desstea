# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DessTea** is a tea shop management system with two apps sharing a Supabase backend:

- **`desstea-mobile/`** — Expo/React Native POS app for branch managers (offline-first, SQLite + Supabase sync)
- **`desstea-website/`** — Next.js admin dashboard for analytics and management

## Commands

### Mobile (`desstea-mobile/`)

```bash
expo start          # Start dev server
expo run:android    # Run on Android
expo run:ios        # Run on iOS
expo lint           # Lint
```

### Website (`desstea-website/`)

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # Lint
```

> **Important for website:** This is a newer version of Next.js with breaking changes. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

## Architecture

### Mobile App

- **Routing**: Expo Router v6 (file-based), `app/(auth)/` for login, `app/(tabs)/` for protected tabs
- **Offline-first**: SQLite (`expo-sqlite`) is the local source of truth. Orders are queued via an outbox pattern and synced to Supabase.
- **Sync**: Watermark-based incremental sync via `lib/sync.ts`. Full sync on first run, incremental after. Sync state exposed via `SyncContext` (`lib/sync-context.tsx`).
- **Auth**: Supabase Auth with `expo-secure-store`. Role gating — only `branch_manager` role can log in.
- **Database**: 23 SQLite tables defined in `lib/database.ts`. WAL mode, foreign keys enabled.
- **Features**: Each domain lives in `features/{name}/` with sub-folders for hooks, components, screens, services.

### Website

- **Routing**: Next.js App Router, dashboard routes under `app/(dashboard)/`
- **Data**: Server Components fetch from Supabase directly. `use cache` for memoization. Suspense boundaries with loading states.
- **Auth**: Supabase SSR auth via cookies. Service role key for privileged ops.
- **Features**: Domain modules in `app/_features/{name}/` (data, components, services). Shared types in `app/_types/`, shared UI in `app/_components/`.
- **Charts**: Recharts for analytics visualizations.

### Shared Backend (Supabase)

- PostgreSQL + Auth + Realtime
- Key tables: `categories`, `products`, `combos`, `addon_groups`, `orders`, `branches`
- Orders store **snapshots** of product names and prices at time of order (e.g., `product_name_snapshot`, `price_modifier_snapshot`) — do not break this pattern
- Edge functions managed directly in Supabase (not in this repo)

## Key Conventions

- **TypeScript strict mode** across both apps
- **Feature-based structure**: UI (screens/components) → Business Logic (hooks) → Data (services)
- **Snapshots in orders**: Order line items snapshot product data at time of purchase — always preserve this for audit trail integrity
- **Supabase clients**: Mobile uses `lib/supabase.ts`; website has separate client/server/admin instances in `lib/supabase/`
