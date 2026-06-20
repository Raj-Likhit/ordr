# System Architecture

Ordr is structured using a Modular Layered Architecture to decouple framework-specific logic from core business logic.

## Layers
1. **Presentation (`/app`)**: Next.js App Router, Route Handlers. Exclusively handles HTTP requests, auth gating, input parsing (Zod validation), and routing.
2. **Domain (`/src/modules/*/dto.ts`, `/src/common/types`)**: Defines entities, interfaces, Zod validation schemas, and common errors (`AppError`).
3. **Application (`/src/modules/*/service.ts`)**: Business logic, workflow orchestration.
4. **Infrastructure (`/src/modules/*/repository.ts`)**: Database access (Supabase), caching (Redis), external services (Razorpay, Resend).

## Best Practices
- Controllers MUST NOT contain SQL or business logic.
- Services MUST NOT import `NextResponse` or `Request`.
- All database calls MUST use Repositories.
- All new controllers MUST validate input using Zod DTOs.
- Handle expected errors using `AppError` subclasses.
