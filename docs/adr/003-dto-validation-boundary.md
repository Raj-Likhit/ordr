# ADR 003: DTO Validation Boundary

## Status
Accepted

## Context
Currently, many Server Actions and API Routes either manually validate input or don't validate at all before executing database operations. This opens the application to security vulnerabilities, data corruption, and type-safety issues at the boundary between client and server.

## Decision
We will enforce a strict Data Transfer Object (DTO) validation boundary using **Zod**. Every incoming request to a Server Action or API Route MUST be validated against a Zod schema before any further processing occurs.

1. Schemas will be defined in the Domain layer (e.g., `src/modules/cart/cart.dto.ts`).
2. Controllers (Server Actions / API Routes) must use `.parse()` or `.safeParse()` to validate incoming `FormData` or JSON.
3. Only the strongly-typed, validated result of the Zod parsing is passed into the Application Service layer.

## Consequences
- Guaranteed runtime type safety for all external inputs.
- Early failure mechanism for malformed requests (returning 400 Bad Request or a standard validation error object).
- Clearly documented API contracts via typed Zod schemas.
