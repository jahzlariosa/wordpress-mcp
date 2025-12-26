# Repository Guidelines

This repository contains a minimal MCP server that exposes WordPress REST tools over stdio. Use Node.js 18+.

## Project Structure & Module Organization
- `server.mjs`: entrypoint; loads config, builds clients, registers tools, and connects stdio transport.
- `src/`: core modules such as `config.mjs`, `wpClient.mjs`, `imageClient.mjs`, `postTypeResolver.mjs`, `wpUtils.mjs`.
- `src/tools/`: tool registrations by resource (`posts.mjs`, `pages.mjs`, `media.mjs`, `taxonomies.mjs`, `users.mjs`, `meta.mjs`).
- `.env.example`: env template; `.env` is local-only.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm start`: run the MCP server (`server.mjs`) over stdio.
- `npm test`: placeholder; currently exits with an error.

## MCP Agent Commands
- `node server.mjs`: run directly when env vars are already set.
- PowerShell one-liner for ad-hoc runs:
```powershell
$env:WP_URL="https://your-site.example"; $env:WP_USER="your-username"; $env:WP_APP_PASS="xxxx xxxx xxxx xxxx xxxx xxxx"; node server.mjs
```
- MCP host entries should call `node` with the absolute path to `server.mjs` and pass env vars (see `README.md`).

## Coding Style & Naming Conventions
- ES modules only (`.mjs`) with Node 18+ APIs.
- 2-space indentation, semicolons, and double quotes as used in existing files.
- Use camelCase for variables/functions; tool modules expose `register*Tools` functions.
- File names are lowerCamelCase in `src/` and plural resource names in `src/tools/`.

## Testing Guidelines
- No automated test framework is configured yet.
- If adding tests, place them under a new `tests/` directory and name files `*.test.mjs`; update `npm test` accordingly.

## Commit & Pull Request Guidelines
- Commit messages are short, imperative, and sentence-case (e.g., "Add media uploads").
- PRs should include a brief summary, testing notes (even if "not run"), and mention any new env vars or WordPress plugin requirements.
- Update `README.md` and `.env.example` when configuration or behavior changes.

## Security & Configuration Tips
- Never commit secrets; keep credentials in `.env` only.
- Required env vars: `WP_URL`, `WP_USER`, `WP_APP_PASS`. Optional image generation keys should stay local.
