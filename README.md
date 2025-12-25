# WordPressMCP Server

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-jahzlariosa-FFDD00?logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/jahzlariosa)

Minimal MCP server that exposes WordPress REST tools over stdio. It supports
posts, pages, users, plugins, and dynamic CPT routing via `type`/`post_type`.

## Requirements

- Node.js 18+ (fetch API required)
- WordPress Application Password

## Setup

1) Install dependencies:
```bash
npm install
```

2) Create a `.env` file (see `.env.example`):
```env
WP_URL="https://your-site.example"
WP_USER="your-username"
WP_APP_PASS="xxxx xxxx xxxx xxxx xxxx xxxx"
```

3) Run the server:
```bash
npm start
```

## MCP Host Config (config.toml)

If your AI host uses a `config.toml` to register MCP servers, add an entry like:
```toml
[mcp.servers.WordPressMCP]
command = "node"
args = ["/absolute/path/to/server.mjs"]
env = { WP_URL = "https://your-site.example", WP_USER = "your-username", WP_APP_PASS = "xxxx xxxx xxxx xxxx xxxx xxxx" }
```

If your host does not support inline `env`, configure it to load `.env` or set
`WP_URL`, `WP_USER`, and `WP_APP_PASS` in the process environment.

## Notes

- The server uses the stdio transport, so run it under your MCP host.
- For custom post types, pass `type` or `post_type` with the CPT slug or REST base.
  Example: `type: "announcement"` routes to `/wp-json/wp/v2/announcement`.
- `create_post` also supports `status` overrides like `announcement:draft` to
  target a CPT without a separate `type` arg.

## Sponsorship

If this project helps, consider supporting it:

<a href="https://www.buymeacoffee.com/jahzlariosa">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="160" alt="Buy Me a Coffee">
</a>

- buy_me_a_coffee: jahzlariosa

## Project Layout

- `server.mjs`: entrypoint, tool registration
- `src/config.mjs`: env parsing and validation
- `src/wpClient.mjs`: WordPress REST client
- `src/wpUtils.mjs`: query/form helpers and post-type parsing
- `src/postTypeResolver.mjs`: cached CPT resolver
- `src/tools/`: tool registration modules
