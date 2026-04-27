# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cross-platform WebDAV desktop client built with **Tauri 2 + Svelte 5**. Connects to WebDAV servers, browses files, previews multiple formats (text, images, PDF, audio/video, DOCX, XLSX), edits text in-place, and performs file operations (upload, download, create folder, delete, rename, copy, move). Supports i18n (Chinese/English) and dark mode.

## Development Commands

```bash
# Development (starts Vite dev server + Tauri window)
pnpm tauri dev

# Production build
pnpm tauri build

# Frontend only (no Tauri window)
pnpm dev

# Type checking (Svelte/TypeScript)
pnpm check

# Rust linting/formatting (run from src-tauri/)
cd src-tauri && cargo clippy
cd src-tauri && cargo fmt --check
```

No test framework is configured (no Rust `#[test]`, no JS test runner).

## Architecture

Two-layer architecture communicating via Tauri IPC (`invoke`):

**Rust backend** (`src-tauri/`): All WebDAV protocol interaction via `reqwest_dav`. 19 Tauri commands across 7 modules in `src-tauri/src/commands/`. State lives in `AppState` (`src-tauri/src/webdav/mod.rs`) — a `Mutex<HashMap<String, WebDavClient>>` for connections and `Mutex<Option<String>>` for the active connection ID. Connection profiles are persisted via `tauri-plugin-store` into `connections.json`.

**Svelte 5 frontend** (`src/`): Single-page app using Svelte 5 runes (`$state`) for reactivity. `src/lib/api.ts` wraps all `invoke()` calls. Four store modules in `src/lib/stores/` (`browser`, `connections`, `preview`, `toast`) encapsulate domain state. Components organized by feature in `src/lib/components/` (layout, connection, browser, preview).

### Data flow
Component → store function → `api.ts` `invoke()` → Rust command → `AppState.get_client()` → WebDAV operation → result returned via IPC → store updates reactive state → Svelte re-renders

### Key patterns
- `AppState::get_client()` clones the `WebDavClient` before async work to avoid holding the Mutex lock across `.await`
- `FileMetadata` uses `Serialize` only (Rust→frontend), `ConnectionProfile` derives both `Serialize`/`Deserialize` (bidirectional)
- Dark mode is CSS-only via `@media (prefers-color-scheme: dark)` with custom properties in `app.css`
- i18n uses `svelte-i18n` with locale files in `src/lib/i18n/`
- **Timeouts**: All WebDAV operations have `tokio::time::timeout` wrappers (10-300s depending on operation type)
- **Path normalization**: `WebDavClient::normalize_path()` ensures all paths start with `/` (handles root edge case)
- **Request cancellation**: Preview operations use `AbortController` signal passed to `invoke()` for canceling in-flight downloads
- **Preview size limits**: 50MB limit for binary previews; oversized files show friendly error instead of hanging

## Key Dependencies

Rust: `tauri 2`, `reqwest_dav 0.3`, `tokio 1` (full), `tauri-plugin-store/dialog/fs 2`, `thiserror 2`, `serde/serde_json`, `uuid 1`

Frontend: `svelte ^5`, `@tauri-apps/api ^2`, `pdfjs-dist`, `docx-preview`, `xlsx` (SheetJS), `svelte-i18n`, `tailwindcss 4`, `vite 8`

## Requirements

- Node.js >= 18, Rust >= 1.77, pnpm
- Tauri 2 CLI: `pnpm add -D @tauri-apps/cli`
