# Copilot Instructions for AI Agents

## Project Overview

- This is a Next.js app (TypeScript) for a Pomodoro tracker, bootstrapped with `create-next-app`.
- Main source code is in `src/app/`.
- Entry point: `src/app/page.tsx` (main UI), with global styles in `src/app/globals.css`.
- Project configuration: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`.

## Developer Workflows

- **Start dev server:** `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`).
- **Hot reload:** Editing files in `src/app/` auto-updates the browser.
- **Build for production:** `npm run build`.
- **Lint:** `npx eslint .` (uses `eslint.config.mjs`).
- **Type-check:** `npx tsc` (uses `tsconfig.json`).

## Patterns & Conventions

- **Pages:** Each route is a file in `src/app/` (e.g., `page.tsx` for `/`).
- **Global layout:** `src/app/layout.tsx` wraps all pages.
- **Styling:** Use CSS modules or global styles in `globals.css`.
- **Font:** Uses `next/font` for optimized font loading (Geist).
- **No custom server logic** detected; all logic is client-side or Next.js API routes.

## External Integrations

- **Deployment:** Vercel is recommended (see README).
- **No detected third-party APIs or custom backend** in current codebase.

## Example: Adding a New Page

1. Create `src/app/[route]/page.tsx`.
2. Export a React component as default.
3. Use global styles or import a CSS module.

## Key Files

- `src/app/page.tsx`: Main Pomodoro tracker UI.
- `src/app/layout.tsx`: App-wide layout.
- `src/app/globals.css`: Global styles.
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`: Project configuration.

## AI Agent Guidance

- Follow Next.js app directory conventions.
- Prefer TypeScript and functional React components.
- Reference existing files for structure and style.
- Use Vercel deployment for production.

---

_If any conventions or workflows are unclear, ask the user for clarification or examples from their codebase._
