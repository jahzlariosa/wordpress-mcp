# WordPressMCP Server

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-jahzlariosa-FFDD00?logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/jahzlariosa)

Minimal MCP server that exposes WordPress REST tools over stdio. It supports
posts, pages, categories, tags, users, plugins, and dynamic CPT routing via
`type`/`post_type`.

## Requirements

- Node.js 18+ (fetch API required)
- WordPress Application Password
- Optional: MCP REST Helper plugin for Yoast SEO meta via REST: https://github.com/jahzlariosa/mcp-rest-helper

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
- Taxonomy tools are available for categories and tags (`list_*`, `get_*`,
  `create_*`, `update_*`, `delete_*`).
- `list_posts` accepts `categories`, `tags`, `categories_exclude`, and
  `tags_exclude` filters; `create_post`/`update_post` accept `categories` and
  `tags`.
- Yoast SEO meta can be set via a `yoast` object on `create_post`, `update_post`,
  `create_page`, and `update_page` (title, description, focus keyphrase,
  keyphrase synonyms, related keyphrases, canonical, robots noindex/nofollow,
  and OG/Twitter overrides). Premium fields require Yoast Premium to be active.
- Premium Yoast fields available in `yoast`: `focuskw_synonyms`,
  `focuskeywords`, `keywordsynonyms` (provide the raw Yoast string/JSON format).

## WordPress Helper Plugin

If you need to update Yoast SEO fields through the REST API, install the MCP REST Helper plugin from https://github.com/jahzlariosa/mcp-rest-helper.
It registers the Yoast meta keys (including premium keyphrase fields when Yoast Premium is active) for all REST-enabled post types so MCP updates can persist.

You can install it from GitHub:

- Download the zip from https://github.com/jahzlariosa/mcp-rest-helper/releases and unzip it into `wp-content/plugins/`.
- Or clone directly: `git clone https://github.com/jahzlariosa/mcp-rest-helper.git` into `wp-content/plugins/mcp-rest-helper`.

## Sponsorship

If this project helps, consider supporting it:

<a href="https://www.buymeacoffee.com/jahzlariosa">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="160" alt="Buy Me a Coffee">
</a>

## Project Layout

- `server.mjs`: entrypoint, tool registration
- `src/config.mjs`: env parsing and validation
- `src/wpClient.mjs`: WordPress REST client
- `src/wpUtils.mjs`: query/form helpers and post-type parsing
- `src/postTypeResolver.mjs`: cached CPT resolver
- `src/tools/`: tool registration modules
