# ADR 0001: Modular Layered Architecture for Next.js

## Context
The current codebase was built as a rapid prototype, resulting in tight coupling between UI components, database access (Supabase JS client), and business logic. The application suffers from inconsistent folder structures, scattered queries, and lacks strict domain boundaries, making it hard to test, scale, and maintain.

## Decision
We are adopting a **Modular Layered Architecture** adapted for the Next.js App Router ecosystem. While Next.js heavily dictates the presentation layer (`/app`), we will extract all business logic, data access, and domain rules into a framework-agnostic `/src/modules` directory.

### Target Architecture Layers:
1. **Presentation Layer (`/app`, `/components`):** 
   - Contains React Server/Client Components, Next.js API Route Handlers, and Server Actions.
   - Strictly handles HTTP concerns, form parsing, rendering, and calling the Application layer.
2. **Application Layer (`/src/modules/*/service.ts`):**
   - Contains Use Cases and Business Logic.
   - Orchestrates workflows between Repositories and Domain Entities.
3. **Domain Layer (`/src/modules/*/types.ts`, `/src/modules/*/dto.ts`):**
   - Contains strict TypeScript interfaces, DTOs (Zod schemas), and domain errors.
4. **Infrastructure Layer (`/src/modules/*/repository.ts`, `/src/infrastructure/`):**
   - Contains Supabase data access logic, Redis caching, and third-party integrations (Stripe, Resend).

### Dependency Rule
Inner layers (Domain, Application) must NEVER depend on outer layers (Presentation, Next.js specifics like `next/headers`). Cross-layer communication strictly flows inward.

## Status
Accepted

## Consequences
- **Pros:** Highly testable logic, separation of concerns, framework agnosticism, and clear domain boundaries.
- **Cons:** High initial refactoring cost. Requires significant file movement and strict adherence to DTO mapping.
