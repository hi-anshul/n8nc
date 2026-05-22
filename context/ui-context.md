# UI Context

## Theme

Dark-only interface inspired by:

* Vercel
* Linear
* Raycast
* Superhuman

The interface should feel:

* minimal
* clean
* premium
* sharp
* technical
* monochrome-first

Avoid:

* purple neon gradients
* excessive glow effects
* colorful dashboards
* glassmorphism-heavy styling
* flashy startup aesthetics

The entire product should primarily use:

* black backgrounds
* white text
* subtle gray surfaces
* thin borders
* white primary actions

Accent colors should be extremely restrained.

The UI should feel:

> “like a modern developer infrastructure tool”

## Colors

All colors must be CSS variables inside `globals.css`.

Never use hardcoded Tailwind colors or hex values directly inside components.

| Role                | CSS Variable       | Value     |
| ------------------- | ------------------ | --------- |
| Page background     | `--bg-base`        | `#000000` |
| Surface             | `--bg-surface`     | `#0A0A0A` |
| Elevated surface    | `--bg-elevated`    | `#111111` |
| Hover surface       | `--bg-hover`       | `#171717` |
| Sidebar background  | `--bg-sidebar`     | `#050505` |
| Primary text        | `--text-primary`   | `#FAFAFA` |
| Secondary text      | `--text-secondary` | `#A1A1AA` |
| Muted text          | `--text-muted`     | `#737373` |
| Primary button      | `--button-primary` | `#FFFFFF` |
| Primary button text | `--button-text`    | `#000000` |
| Border              | `--border-default` | `#1F1F22` |
| Soft border         | `--border-soft`    | `#141416` |
| Success             | `--state-success`  | `#22C55E` |
| Warning             | `--state-warning`  | `#F59E0B` |
| Error               | `--state-error`    | `#EF4444` |
| Focus ring          | `--focus-ring`     | `#FFFFFF` |

## Typography

| Role      | Font       | CSS Variable        |
| --------- | ---------- | ------------------- |
| UI text   | Geist Sans | `--font-geist-sans` |
| Code/mono | Geist Mono | `--font-geist-mono` |

Typography should feel:

* compact
* clean
* high-end
* developer-focused

Rules:

* Strong hierarchy using weight, not color
* Use whitespace aggressively
* Avoid oversized hero typography
* Prefer medium font weights
* Use muted text for secondary information

## Border Radius

| Context          | Class         |
| ---------------- | ------------- |
| Small controls   | `rounded-lg`  |
| Buttons / Inputs | `rounded-xl`  |
| Cards / Panels   | `rounded-2xl` |
| Modals / Sheets  | `rounded-3xl` |

## Shadows & Depth

Use very subtle depth.

Prefer:

* layered surfaces
* soft shadows
* thin borders
* contrast separation

Avoid:

* strong glows
* colorful shadows
* giant gradients

## Component Library

Use:

* `shadcn/ui`
* Tailwind CSS
* Radix UI primitives

Components live in:

* `components/ui/`

Do not rewrite generated primitives unnecessarily.

## Layout Patterns

* Full-screen application layout
* Fixed left sidebar
* Sticky top navigation
* Large immersive workflow canvas
* Floating right-side configuration panel
* Bottom execution logs panel

The layout should feel spacious and cinematic.

## Navigation

### Sidebar

Style:

* matte black surface
* thin separators
* subtle active states
* compact spacing

Active item:

* slightly elevated background
* white text
* soft border

Inactive item:

* muted gray text
* transparent background

### Top Navbar

Style:

* translucent black background
* subtle blur
* thin bottom border
* compact height

Navbar content:

* workflow title
* save state
* execution controls
* profile menu

## Workflow Canvas

The canvas is the visual centerpiece.

Background:

* deep black
* subtle dotted grid
* low contrast texture

Nodes:

* dark matte cards
* thin borders
* compact spacing
* clean typography
* subtle hover elevation

Edges:

* smooth curves
* white/gray connection lines
* subtle execution animations

## Workflow Node Colors

Keep node colors restrained.

| Node Type    | Style                           |
| ------------ | ------------------------------- |
| Trigger      | Dark surface + green status dot |
| Action       | Dark surface + white icon       |
| Logic        | Dark surface + amber indicator  |
| Delay/System | Dark surface + muted gray icon  |
| Error State  | Dark surface + red border       |

## Buttons

### Primary Buttons

Style:

* white background
* black text
* medium font weight
* subtle hover opacity change

No gradients.
No glow effects.

### Secondary Buttons

Style:

* dark background
* white text
* thin border
* subtle hover surface

### Ghost Buttons

Style:

* transparent
* muted text
* hover surface only

## Inputs

* Matte black backgrounds
* Thin borders
* White text
* Minimal placeholder styling
* Strong visible focus state

## Motion

Motion should feel:

* fast
* intentional
* minimal

Use:

* opacity transitions
* smooth hover fades
* subtle translate animations

Avoid:

* bounce animations
* exaggerated scaling
* flashy movement

## Icons

Use:

* Lucide React

Rules:

* stroke-based only
* no filled icons
* consistent sizing

Sizes:

* inline → `h-4 w-4`
* buttons → `h-5 w-5`
* panels → `h-6 w-6`

## Scrollbars

* Thin custom scrollbars
* Matte dark track
* Gray thumb
* Slight hover contrast

## Accessibility

* High contrast text required
* Visible keyboard focus states required
* Keyboard navigation supported everywhere
* Never rely only on color for meaning

## Responsive Design

Desktop-first workflow editor.

Tablet:

* supported for viewing and lightweight editing

Mobile:

* dashboard and execution logs only for MVP
* no full workflow editing on mobile
