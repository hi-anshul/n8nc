# n8nc

## Overview

n8nc is an AI-assisted workflow automation platform that enables users to create automations using plain English instead of manually building workflows from scratch. Built for creators, startups, operations teams, and non-technical users, the platform converts natural language prompts into editable visual workflow graphs using AI. Users can configure integrations like Notion, activate workflows through webhook-based form triggers, and monitor executions in real time. n8nc solves the “blank canvas” problem in automation tools by combining AI-generated workflow design with a no-code visual editor and real execution engine.

## Goals

1. Enable users to generate a functional workflow graph from a plain English prompt in under 30 seconds.
2. Allow users to configure, activate, and execute Notion-based automations without writing code.
3. Provide a scalable and extensible workflow engine architecture that supports adding new node types and integrations easily.

## Core User Flow

1. User signs up or logs into the platform.
2. User clicks “New Workflow” from the dashboard.
3. User describes an automation in plain English.
4. AI generates a visual workflow graph using ReactFlow.
5. User configures workflow nodes (credentials, field mappings, conditions, delays, etc.).
6. User activates the workflow and copies the generated webhook URL.
7. External systems submit data to the webhook endpoint.
8. n8nc executes the workflow in real time.
9. Results are written to Notion and logged in the execution history page.
10. User reviews execution logs and workflow results.

## Features

### AI Workflow Generation

* Convert plain English automation requests into structured workflow graphs.
* AI-generated workflows include nodes, edges, descriptions, and positioning logic.
* Editable workflow output instead of a black-box automation system.
* Uses Anthropic Claude API for workflow generation.

### Visual Workflow Builder

* Drag-and-drop workflow editor powered by ReactFlow.
* Custom node types for triggers, actions, conditions, and delays.
* Real-time graph editing with auto-save functionality.
* Color-coded nodes and animated execution states.

### Workflow Execution Engine

* Webhook-triggered workflow execution system.
* Topological execution order for node orchestration.
* Execution context threading between nodes.
* Per-node execution logging with success and error states.

### Authentication & User Management

* Secure authentication using Clerk.
* Social login and email/password authentication support.
* Session management and protected routes.
* Scalable authentication infrastructure optimized for SaaS products.

### Notion Integration

* Create and update Notion database pages automatically.
* Configurable field mapping system.
* Secure credential storage with encryption.
* Manual token-based authentication for MVP.

### Execution Monitoring

* Execution history dashboard with timestamps and statuses.
* Detailed per-node logs showing input, output, and errors.
* Manual workflow execution support for testing.

## Scope

### In Scope

* AI-powered workflow generation using natural language.
* Workflow canvas editor with ReactFlow.
* Clerk authentication and user management.
* Supabase database integration.
* Webhook-triggered workflow execution.
* Notion create/update page integrations.
* Execution logs and workflow monitoring.
* Workflow activation and manual execution support.
* Credential management with encrypted storage.

### Out of Scope

* Multi-integration marketplace beyond Notion.
* Custom authentication infrastructure.
* OAuth-based Notion authentication.
* Team collaboration and multi-user editing.
* Billing and subscription management.
* Advanced branching workflows.
* Real-time streaming execution updates.

## Tech Stack

| Layer            | Technology            |
| ---------------- | --------------------- |
| Frontend         | Next.js 14            |
| Authentication   | Clerk                 |
| Database         | Supabase (PostgreSQL) |
| Workflow Canvas  | ReactFlow             |
| AI               | Anthropic Claude API  |
| State Management | Zustand               |
| Styling          | Tailwind CSS          |
| Deployment       | Vercel + Supabase     |

## Success Criteria

1. A signed-in user can generate a valid workflow graph from a natural language prompt.
2. A user can authenticate securely using Clerk.
3. A user can configure and activate a workflow connected to Notion.
4. A form submission successfully triggers workflow execution and creates a Notion page.
5. Execution logs correctly display workflow run status and node-level outputs.
6. Workflow graphs are automatically persisted and restored from Supabase.
7. New node types can be added through the modular executor architecture without changing the core execution engine.
