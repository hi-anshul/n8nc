# n8nc — Master Spec Document
> AI-assisted workflow automation · Next.js + Supabase + Notion · v1.0

---

## 1. Product Overview

n8nc is a full-stack workflow automation tool where users:
1. Describe an automation in plain English
2. AI generates a visual workflow graph (nodes + edges)
3. User configures each node (connects accounts, sets fields)
4. Workflow executes in real-time when a form is submitted
5. Results are written to Notion

**North star demo:** "When someone submits my contact form, create a Notion page in my CRM database, set the name, email, lead source, and status to New."

---

## 2. Tech Stack

| Layer | Choice | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Frontend + API routes |
| Visual canvas | ReactFlow | Drag-and-drop workflow graph |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) | Workflow generation from plain English |
| Database | Supabase (PostgreSQL) | Store workflows, executions, credentials |
| Auth | Supabase Auth | User accounts |
| Integrations | Notion API | Target action |
| Form trigger | Next.js API route | Webhook-style form submission trigger |
| Styling | Tailwind CSS | UI |
| State | Zustand | Workflow canvas state |
| Deploy | Vercel (frontend) + Supabase (DB) | Hosting |

---

## 3. Data Models

### `workflows`
```sql
id           uuid primary key default gen_random_uuid()
user_id      uuid references auth.users
name         text
description  text
graph        jsonb        -- ReactFlow nodes + edges
is_active    boolean default false
trigger_slug text unique  -- e.g. "abc123" used in webhook URL
created_at   timestamptz default now()
updated_at   timestamptz default now()
```

### `executions`
```sql
id           uuid primary key default gen_random_uuid()
workflow_id  uuid references workflows
status       text  -- 'running' | 'success' | 'error'
trigger_data jsonb -- raw form payload
node_results jsonb -- per-node output { nodeId: { status, output, error } }
started_at   timestamptz default now()
finished_at  timestamptz
```

### `credentials`
```sql
id           uuid primary key default gen_random_uuid()
user_id      uuid references auth.users
service      text  -- 'notion'
label        text  -- user-facing name e.g. "My Notion workspace"
encrypted_token text  -- store encrypted with Supabase Vault or env-based encryption
created_at   timestamptz default now()
```

---

## 4. Folder Structure

```
n8nc/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   └── page.tsx               -- list of workflows
│   ├── workflows/
│   │   ├── new/page.tsx           -- create workflow (AI prompt)
│   │   └── [id]/
│   │       ├── page.tsx           -- canvas editor
│   │       └── executions/page.tsx
│   └── api/
│       ├── ai/generate/route.ts   -- POST: plain English → graph JSON
│       ├── workflows/
│       │   ├── route.ts           -- GET list, POST create
│       │   └── [id]/route.ts      -- GET, PUT, DELETE
│       ├── trigger/
│       │   └── [slug]/route.ts    -- POST: form submission webhook
│       └── execute/
│           └── [workflowId]/route.ts -- POST: run workflow manually
├── components/
│   ├── canvas/
│   │   ├── WorkflowCanvas.tsx     -- ReactFlow wrapper
│   │   ├── nodes/
│   │   │   ├── TriggerNode.tsx
│   │   │   ├── ActionNode.tsx
│   │   │   └── ConditionNode.tsx
│   │   └── NodeConfigPanel.tsx    -- sidebar for configuring selected node
│   ├── AIPromptBox.tsx            -- plain English input
│   ├── ExecutionLog.tsx           -- live run results
│   └── CredentialManager.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── ai/
│   │   └── generateWorkflow.ts    -- Claude API call + response parser
│   ├── executor/
│   │   ├── index.ts               -- orchestrates node execution
│   │   └── nodes/
│   │       ├── formTrigger.ts
│   │       └── notionCreatePage.ts
│   └── notion/
│       └── client.ts              -- Notion API wrapper
├── store/
│   └── workflowStore.ts           -- Zustand store
└── types/
    └── workflow.ts                -- shared types
```

---

## 5. Node Types (MVP)

### Trigger nodes (entry points)
| Node type | ID | Description |
|---|---|---|
| Form submission | `form_trigger` | Receives POST from a form. Has a unique webhook URL. |

### Action nodes
| Node type | ID | Description |
|---|---|---|
| Notion — create page | `notion_create_page` | Creates a page in a Notion database. Configurable: database ID, field mappings. |
| Notion — update page | `notion_update_page` | Updates properties on an existing Notion page. |

### Logic nodes
| Node type | ID | Description |
|---|---|---|
| Condition | `condition` | If/else branch. Evaluates a field against a value. |
| Delay | `delay` | Wait N seconds/minutes before next node. |

---

## 6. Workflow Graph Schema (ReactFlow-compatible JSON)

```typescript
// types/workflow.ts

export type NodeType =
  | 'form_trigger'
  | 'notion_create_page'
  | 'notion_update_page'
  | 'condition'
  | 'delay'

export interface WorkflowNode {
  id: string                  // e.g. "node_1"
  type: NodeType
  position: { x: number; y: number }
  data: {
    label: string             // display name
    description: string       // one-line explanation shown on the node
    config: Record<string, unknown>  // node-specific config (see below)
  }
}

export interface WorkflowEdge {
  id: string
  source: string              // nodeId
  target: string              // nodeId
  sourceHandle?: string       // 'true' | 'false' for condition nodes
  label?: string
}

export interface WorkflowGraph {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}
```

### Per-node config shapes

```typescript
// form_trigger
{ webhookUrl: string }  // auto-generated, read-only

// notion_create_page
{
  credentialId: string,
  databaseId: string,
  fieldMappings: Array<{
    notionProperty: string,   // e.g. "Name"
    notionType: string,       // e.g. "title" | "rich_text" | "select" | "email"
    valueSource: 'trigger_field' | 'static',
    triggerField?: string,    // e.g. "name" — key from form payload
    staticValue?: string
  }>
}

// condition
{
  field: string,        // key from trigger data or previous node output
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than',
  value: string
}

// delay
{ unit: 'seconds' | 'minutes', amount: number }
```

---

## 7. AI Workflow Generation

### API route: `POST /api/ai/generate`

**Request:**
```json
{ "prompt": "When someone submits my contact form, create a Notion page in my CRM database with their name, email and set status to New" }
```

**System prompt to Claude:**
```
You are n8nc's AI engine. Your job is to convert a plain English automation description into a structured workflow graph.

You must output ONLY valid JSON. No explanation, no markdown, no preamble.

The output must match this schema exactly:
{
  "name": string,           // short workflow name
  "description": string,    // one sentence summary
  "nodes": WorkflowNode[],
  "edges": WorkflowEdge[]
}

Available node types: form_trigger, notion_create_page, notion_update_page, condition, delay

Node placement rules:
- form_trigger always at position { x: 100, y: 200 }
- Each subsequent node 300px to the right of the previous
- Leave config values as sensible defaults or empty strings — the user will fill them in

Always start with a form_trigger node. Generate IDs as "node_1", "node_2", etc.
Edge IDs as "edge_1", "edge_2", etc.

Return only the JSON object. Nothing else.
```

**Response parsing in `lib/ai/generateWorkflow.ts`:**
```typescript
const raw = response.content[0].text
const cleaned = raw.replace(/```json|```/g, '').trim()
const graph: WorkflowGraph = JSON.parse(cleaned)
return graph
```

---

## 8. Execution Engine

### Flow: `POST /api/trigger/[slug]`

1. Look up workflow by `trigger_slug` in Supabase
2. Check `is_active === true`
3. Create an `executions` row with status `'running'`
4. Pass `{ workflowId, triggerData: req.body }` to `lib/executor/index.ts`
5. Return `{ executionId }` immediately (fire and forget for now — no streaming in MVP)

### Executor: `lib/executor/index.ts`

```typescript
async function executeWorkflow(workflowId: string, triggerData: Record<string, unknown>) {
  // 1. Load workflow graph from Supabase
  // 2. Topological sort nodes by edges
  // 3. Execute each node in order
  // 4. Pass output of each node as context to the next
  // 5. Update executions row with node_results and final status
}
```

### Node executor pattern
Each node type has its own file in `lib/executor/nodes/`:

```typescript
// lib/executor/nodes/notionCreatePage.ts
export async function execute(
  config: NotionCreatePageConfig,
  context: ExecutionContext   // { triggerData, previousOutputs }
): Promise<NodeResult> {
  // resolve field values from context
  // call Notion API
  // return { status: 'success', output: { pageId, pageUrl } }
}
```

### Context threading
Each node receives:
```typescript
interface ExecutionContext {
  triggerData: Record<string, unknown>   // raw form payload
  previousOutputs: Record<string, unknown>  // nodeId → output
}
```

Field mapping resolves like: if `valueSource === 'trigger_field'`, look up `triggerData[triggerField]`.

---

## 9. Notion Integration

### Auth flow (MVP — manual token)
1. User goes to Settings → Credentials
2. Pastes their Notion Internal Integration Token
3. App stores it in `credentials` table (encrypt with `CREDENTIAL_ENCRYPTION_KEY` env var using AES-256)
4. On workflow execution, decrypt and use token

### Notion create page call
```typescript
// lib/notion/client.ts
import { Client } from '@notionhq/client'

export async function createPage(token: string, databaseId: string, properties: Record<string, unknown>) {
  const notion = new Client({ auth: token })
  return notion.pages.create({
    parent: { database_id: databaseId },
    properties
  })
}
```

### Property type mapping
| n8nc type | Notion API shape |
|---|---|
| `title` | `{ title: [{ text: { content: value } }] }` |
| `rich_text` | `{ rich_text: [{ text: { content: value } }] }` |
| `email` | `{ email: value }` |
| `select` | `{ select: { name: value } }` |
| `number` | `{ number: Number(value) }` |

---

## 10. Key UI Screens

### 10.1 Dashboard (`/dashboard`)
- List of user's workflows (name, status badge, last run, trigger URL)
- "New workflow" button
- Each workflow links to canvas editor

### 10.2 New Workflow (`/workflows/new`)
- Full-screen AI prompt box: "Describe your automation..."
- Submit → calls `/api/ai/generate` → redirects to canvas with pre-built graph
- Loading state: "n8nc is building your workflow..."

### 10.3 Canvas Editor (`/workflows/[id]`)
Layout: left sidebar (node library) | center (ReactFlow canvas) | right panel (node config)

**Canvas:**
- Nodes rendered with custom components per type
- Color coded: green = trigger, blue = action, yellow = condition, gray = delay
- Edges with animated dashes when workflow is running
- "Run manually" button top-right
- "Activate" toggle (sets `is_active`)
- Auto-save on any graph change (debounced 1s)

**Node config panel (right):**
- Opens when a node is clicked
- Shows the node's configurable fields
- Notion node: credential selector + database ID field + field mapping table
- Condition node: field selector + operator dropdown + value input

**Trigger URL banner (bottom):**
- Shown when trigger node is selected
- Displays: `POST https://yourapp.com/api/trigger/[slug]`
- Copy button
- Example curl command

### 10.4 Execution Log (`/workflows/[id]/executions`)
- List of runs with timestamp, status, duration
- Click any run to see per-node results
- Each node shows: status icon, input data, output data, error if any

---

## 11. API Routes Summary

| Method | Route | Description |
|---|---|---|
| POST | `/api/ai/generate` | Plain English → workflow graph JSON |
| GET | `/api/workflows` | List user's workflows |
| POST | `/api/workflows` | Create workflow |
| GET | `/api/workflows/[id]` | Get workflow |
| PUT | `/api/workflows/[id]` | Update workflow (graph, name, is_active) |
| DELETE | `/api/workflows/[id]` | Delete workflow |
| POST | `/api/trigger/[slug]` | Receive form submission, execute workflow |
| POST | `/api/execute/[workflowId]` | Manual run (uses empty trigger data) |
| GET | `/api/executions/[workflowId]` | List executions for a workflow |

---

## 12. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Credential encryption
CREDENTIAL_ENCRYPTION_KEY=   # 32-byte random string

# App
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

---

## 13. Build Order (Cursor Sessions)

Follow this exact order. Each session = one Cursor conversation.

| Session | What to build | Prompt to give Cursor |
|---|---|---|
| 1 | Project scaffold | "Set up Next.js 14 with App Router, Tailwind, Supabase client, ReactFlow, Zustand. Create the folder structure from the spec." |
| 2 | Supabase schema | "Create the SQL migrations for workflows, executions, credentials tables from the spec. Set up RLS policies." |
| 3 | Auth | "Build login and signup pages using Supabase Auth. Protect all /dashboard and /workflows routes." |
| 4 | Dashboard | "Build the dashboard page that lists workflows from Supabase with name, status, last run, and a New Workflow button." |
| 5 | AI generate route | "Build POST /api/ai/generate using the Anthropic Claude API and the exact system prompt from the spec." |
| 6 | Canvas editor (base) | "Build the canvas page with ReactFlow. Custom node components for form_trigger, notion_create_page, condition, delay. Color coded per spec." |
| 7 | Node config panel | "Build the right-side config panel. Clicking a node opens its config form. Auto-save to Supabase on change." |
| 8 | Notion integration | "Build the credentials manager and lib/notion/client.ts. Implement the notionCreatePage executor node." |
| 9 | Execution engine | "Build the executor in lib/executor/index.ts. Implement POST /api/trigger/[slug] and POST /api/execute/[workflowId]." |
| 10 | Execution log | "Build the executions page. Show per-node results with status, input, output for each run." |
| 11 | Polish + deploy | "Add loading states, error handling, empty states. Deploy to Vercel. Set all env vars." |

---

## 14. Demo Script (for portfolio)

**Setup:** Create a Notion database called "CRM" with columns: Name (title), Email (email), Lead Source (select: Website / Referral / Event), Status (select: New / Contacted / Qualified).

**Demo flow:**
1. Open n8nc → New Workflow
2. Type: *"When someone submits my contact form, add them to my Notion CRM with their name, email, set Lead Source to Website and Status to New"*
3. AI generates the graph (form_trigger → notion_create_page)
4. Configure the Notion node: select credential, paste database ID, map fields
5. Activate the workflow → copy trigger URL
6. Open Postman / curl and POST a form payload: `{ "name": "Sarah Chen", "email": "sarah@example.com" }`
7. Show the Notion database — new page appeared with correct fields
8. Open execution log — show the run, node-by-node results

**Talking points:**
- AI removes the blank-canvas problem: you describe intent, not implementation
- The graph is editable — AI gives you a starting point, not a black box
- Real execution, not simulation — the Notion page actually exists
- Extensible: adding new node types is a matter of adding one file to `lib/executor/nodes/`

---

## 15. Out of Scope for MVP

- Multi-step branching beyond one condition node
- OAuth for Notion (use internal token for MVP)
- Real-time streaming execution updates (polling is fine)
- Multiple integrations beyond Notion
- Team / collaboration features
- Billing

---

*Last updated: May 2026 · n8nc v1.0 MVP spec*
