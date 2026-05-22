# Architecture Context

## Stack

| Layer            | Technology                    | Role                                                               |
| ---------------- | ----------------------------- | ------------------------------------------------------------------ |
| Framework        | Next.js 14 + TypeScript       | Full-stack application framework using App Router                  |
| UI               | Tailwind CSS + shadcn/ui      | Modern component system and styling foundation                     |
| Workflow Canvas  | ReactFlow                     | Visual workflow graph editor and node system                       |
| State Management | Zustand                       | Centralized workflow canvas and UI state                           |
| Authentication   | Clerk                         | User authentication, session management, and route protection      |
| Database         | Supabase PostgreSQL           | Relational data storage for workflows, executions, and credentials |
| ORM / DB Access  | Supabase Client SDK           | Database communication and typed queries                           |
| AI               | Anthropic Claude API          | Plain-English workflow generation                                  |
| Integrations     | Notion API                    | Workflow action target for database/page operations                |
| Background Logic | Custom Workflow Executor      | Deterministic workflow orchestration and node execution            |
| Deployment       | Vercel + Supabase             | Frontend hosting, API runtime, and managed database                |
| Styling System   | CSS Variables + Design Tokens | Consistent dark-mode design system                                 |
| Icons            | Lucide React                  | Stroke-based icon system                                           |

## System Boundaries

* `app/` — owns routing, layouts, API routes, page composition, and route-level orchestration
* `app/api/` — owns thin HTTP route handlers only; no heavy business logic or execution logic
* `components/` — owns UI rendering and presentation logic only
* `components/canvas/` — owns ReactFlow rendering, workflow nodes, and visual workflow interactions
* `components/ui/` — owns reusable UI primitives generated through shadcn/ui
* `lib/ai/` — owns AI prompt generation, Claude communication, response parsing, and schema validation
* `lib/executor/` — owns workflow orchestration, execution ordering, node execution lifecycle, and execution context propagation
* `lib/executor/nodes/` — owns isolated execution logic for each workflow node type
* `lib/integrations/` — owns external provider wrappers, SDK abstraction, and integration-specific transformations
* `lib/notion/` — owns Notion API communication and property mapping logic
* `lib/auth/` — owns Clerk authentication helpers and server-side authorization utilities
* `lib/supabase/` — owns database clients, server utilities, and persistence helpers
* `store/` — owns Zustand stores, workflow graph state, and client-side editor state
* `types/` — owns shared application contracts, graph schemas, execution types, and integration interfaces
* `styles/` — owns design tokens, CSS variables, and global theme configuration

## Storage Model

* **Supabase PostgreSQL**: Stores users, workflows, workflow metadata, execution logs, node results, trigger slugs, encrypted credentials references, and ownership relationships
* **Workflow Graph JSON**: Stores ReactFlow-compatible node and edge structures for workflow persistence
* **Encrypted Credentials Storage**: Stores encrypted third-party integration tokens and credential metadata
* **Runtime Execution Context**: Stores transient execution state, previous node outputs, and workflow execution traces
* **Environment Variables**: Stores API keys, encryption secrets, and server-only credentials
* **Client State (Zustand)**: Stores transient workflow editor state and unsaved UI interactions

## Auth and Access Model

* Every user authenticates through Clerk
* All dashboard, workflow, execution, and credential routes require authentication
* Every workflow belongs to a single authenticated owner
* Workflow ownership must always be verified server-side before reads or mutations
* API routes must never trust client-provided ownership or user identifiers
* Credentials are private and scoped to the owning user only
* Trigger endpoints may execute publicly via webhook slug, but workflow ownership and activation state must still be verified internally
* Only authenticated owners can create, update, activate, execute, or delete workflows
* Secrets and integration tokens must never be exposed to the browser or client-side state

## Invariants

1. Request handlers must never perform long-running workflow execution directly inside the HTTP lifecycle
2. All AI-generated workflow graphs must pass schema validation before persistence or execution
3. Workflow execution order must always be derived from graph topology, never from array position
4. Every workflow node type must define:

   * a UI renderer
   * a configuration schema
   * an executor
   * validation rules
5. Route handlers must remain orchestration-only and cannot contain integration-specific business logic
6. External API responses must always be validated before entering the system
7. All third-party credentials must be encrypted before storage
8. Client components must never directly access secrets, service keys, or raw credentials
9. Zustand is the single source of truth for workflow canvas state
10. Workflow graph mutations must occur through typed actions only
11. Execution logs are append-only records and must remain traceable for debugging
12. Node executors must remain isolated and independently testable
13. Components must never directly communicate with external integrations
14. All workflow mutations require authenticated ownership verification
15. AI prompt templates and generation logic must remain provider-agnostic where possible
16. No business logic may live inside UI components
17. The workflow canvas must remain functional without requiring AI generation
18. Integration modules must remain replaceable and loosely coupled from the execution engine
19. The system must remain extensible so that new node types can be added without modifying the core executor
20. No raw hex colors, inline styles, or hardcoded theme values may appear in application components
