# ADR 001: Strict Layered Architecture

## Status
Accepted

## Context
The application was built incrementally, leading to business logic, database queries, and HTTP concerns being mixed across Server Actions, API routes, and React components. This tight coupling makes the codebase difficult to test, hard to scale, and prone to duplicated logic.

## Decision
We will enforce a strict layered architecture across the entire application, dividing the codebase into four distinct layers:

1. **Presentation Layer (`/app`, `/components`)**: Handles React UI, user interactions, Next.js routing, and HTTP request parsing/response formatting.
2. **Application Layer (`/src/modules/*/service.ts`)**: Contains pure business logic. Orchestrates operations but knows nothing about HTTP or React.
3. **Domain Layer (`/src/modules/*/dto.ts`, `*.interface.ts`)**: Defines data structures (DTOs), Zod schemas for validation, and core bounded contexts.
4. **Infrastructure Layer (`/src/modules/*/repository.ts`, `/src/infrastructure/`)**: Handles all external I/O, including database queries (Supabase), email services (Resend), and payment gateways (Stripe).

**Dependency Rule**: Inner layers (Domain, Application) must not depend on outer layers (Presentation, Infrastructure). All database access must go through Repositories, and all business logic must go through Services.

## Consequences
- Better testability: Services and Repositories can be unit-tested in isolation without mocking Next.js or React.
- Increased boilerplate: We must write explicit interfaces, DTOs, and mapping layers.
- Clearer boundaries: Prevents "God files" and keeps components purely focused on UI.
