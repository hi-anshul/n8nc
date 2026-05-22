# Code Standards

## General

* Keep workflow logic modular and node-driven.
* Fix architectural problems at the source — avoid temporary patches or duplicated execution logic.
* Do not mix UI rendering, workflow execution, and integration logic in the same module.
* Respect the separation between workflow generation, execution engine, integrations, and presentation layers.
* Every workflow node must have a clearly defined responsibility and execution contract.
* Prefer extensibility over shortcuts — new node types should be easy to add without changing core infrastructure.
* Respect the boundaries defined in architecture-context.md.

## TypeScript

* Strict mode is required throughout the project.
* Avoid `any`; use explicit interfaces, discriminated unions, or typed generics.
* Validate all external inputs including AI responses, webhook payloads, and integration data before use.
* Use `interface` for object contracts and shared workflow schemas.
* Shared types must live inside `types/` and remain framework-agnostic.
* ReactFlow graph structures must always conform to the shared `WorkflowGraph` schema.

## Next.js

* Default to React Server Components.
* Add `"use client"` only for interactive canvas behavior, drag-and-drop, hooks, or live state updates.
* Keep route handlers thin and focused on orchestration only.
* Long-running workflow execution must happen outside the request lifecycle.
* API routes should never contain integration-specific business logic directly.
* Use server actions or shared service modules for reusable backend operations.

## ReactFlow & Canvas

* All node components must remain presentation-focused.
* Node configuration logic belongs in dedicated config panels or workflow services.
* Canvas state must be centralized using Zustand.
* Auto-save operations must be debounced to avoid excessive writes.
* Avoid direct graph mutations — use typed workflow state actions.
* Every node type must define:

  * UI component
  * config schema
  * executor
  * validation rules

## AI Workflow Generation

* AI-generated output must always be schema-validated before persistence.
* Never trust raw LLM output directly.
* Keep prompts deterministic and version-controlled.
* AI routes should return structured JSON only.
* Prompt templates belong in isolated AI service modules.
* Workflow generation logic must remain provider-agnostic to support future AI model changes.

## Workflow Execution Engine

* Execution logic must remain deterministic and replayable.
* Each node executor must be isolated in its own module.
* Executors should return normalized success/error result objects.
* Context propagation between nodes must be explicit and typed.
* Workflow execution order must be derived from graph topology, not array order.
* Execution state updates should be persisted incrementally for observability.

## Authentication & Authorization

* Authentication must be handled through Clerk.
* Protect all dashboard, workflow, execution, and credential routes.
* Never trust client-provided user IDs or workflow ownership.
* Enforce authorization checks before all workflow mutations and executions.
* Secrets and credentials must never be exposed to the client.

## API Routes

* Validate and parse request input before business logic executes.
* Enforce authentication and workflow ownership checks before mutations.
* Return consistent response shapes across all APIs.
* Keep API handlers orchestration-focused.
* Shared execution, integration, and validation logic belongs in `lib/`.
* Webhook routes must verify workflow activation state before execution.

## Data and Storage

* Relational workflow metadata belongs in Supabase PostgreSQL.
* Workflow graphs must be stored as structured JSON.
* Large execution payloads should not be duplicated unnecessarily.
* Credentials must always be encrypted before persistence.
* Never log raw access tokens, secrets, or integration credentials.
* Execution records are first-class system entities and must remain traceable.

## Integrations

* Every external integration must have:

  * dedicated client wrapper
  * typed request/response handling
  * isolated executor logic
* Integration failures must produce structured errors.
* Integration modules should never directly depend on UI components.
* Keep integration providers replaceable and loosely coupled.

## State Management

* Zustand is the single source of truth for workflow canvas state.
* Avoid prop drilling for workflow graph operations.
* Separate transient UI state from persisted workflow state.
* Derived state should be computed, not duplicated.

## Styling

* Use design tokens and semantic Tailwind utilities defined in `globals.css`.
* Avoid hardcoded color values and inconsistent spacing.
* Maintain consistent radius scale:

  * `rounded-xl` for controls
  * `rounded-2xl` for panels/cards
  * `rounded-3xl` for modals and overlays
* Workflow node colors must remain consistent by category:

  * Green = trigger
  * Blue = action
  * Yellow = logic/condition
  * Gray = delay/system

## File Organization

* `app/` — routes, layouts, and API handlers.
* `components/` — UI components only.
* `components/canvas/` — ReactFlow canvas and node rendering.
* `lib/ai/` — AI prompt generation and parsing.
* `lib/executor/` — workflow orchestration and node execution engine.
* `lib/integrations/` — external service wrappers and SDK abstractions.
* `store/` — Zustand stores and state actions.
* `types/` — shared schemas and contracts.
* Name files after business responsibility, not framework implementation details.

## Performance

* Avoid unnecessary ReactFlow re-renders.
* Lazy load heavy workflow editor dependencies where possible.
* Use optimistic UI carefully for workflow persistence.
* Debounce expensive autosave and validation operations.
* Minimize execution-time database queries through batching and caching.

## Security

* Encrypt all third-party credentials before storage.
* Never expose secret keys to the browser.
* Validate webhook payloads before execution.
* Sanitize all AI-generated content before rendering.
* Apply rate limiting on AI generation and trigger endpoints.
* Maintain auditability for workflow executions and credential usage.

## Testing

* Test workflow execution independently from the UI.
* Node executors require isolated unit tests.
* Integration wrappers must support mocked testing environments.
* Validate graph parsing and execution ordering with deterministic fixtures.
* Critical workflow paths should have end-to-end execution tests.
