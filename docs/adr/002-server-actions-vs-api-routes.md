# ADR 002: Server Actions vs API Routes Conventions

## Status
Accepted

## Context
Next.js App Router provides both Server Actions (functions that can be called directly from client components) and API Routes (`route.ts` handlers). Currently, both are used interchangeably to perform database mutations and fetch data, leading to inconsistent security boundaries and error handling.

## Decision
We will establish strict conventions for when to use Server Actions versus API Routes:

### Server Actions
- Used exclusively for **UI-driven mutations** originating from the Bazl frontend (e.g., submitting a form, adding to cart, updating onboarding status).
- Must act ONLY as thin controllers: parse the input, call the Application Service, and return a standardized result or error object.
- Never directly instantiate the Supabase client or write raw queries.

### API Routes (`route.ts`)
- Used for **external integrations** (e.g., Stripe webhooks, Resend callbacks).
- Used for **CRON jobs** (e.g., Abandoned Cart recovery).
- Used when we need strictly RESTful public endpoints or when streaming binary data.

## Consequences
- Server Actions will remain the primary mutation method for the React frontend, benefiting from progressive enhancement and native type safety.
- Business logic is safely encapsulated in Services, meaning a Server Action and an API Route can both call the exact same Service method without duplicating code.
