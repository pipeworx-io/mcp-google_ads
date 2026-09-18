# mcp-google_ads

Google Ads MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `gads_list_campaigns` | List all campaigns in your Google Ads account. Returns campaign names, IDs, statuses, budgets, and types. Use to overview account structure or find a campaign ID for detailed analysis. |
| `gads_get_campaign` | Get detailed settings for a specific campaign. Returns name, status, budget, bidding strategy, and configuration. Use to review or audit a campaign's current setup. |
| `gads_campaign_metrics` | Get performance metrics for campaigns over a date range. Returns impressions, clicks, cost, conversions, CTR, and CPC. Use to analyze campaign effectiveness or compare performance trends. |
| `gads_list_ad_groups` | List ad groups within a campaign by campaign ID. Returns ad group names, IDs, statuses, and CPC bids. Use to explore campaign structure or select an ad group for analysis. |
| `gads_search` | Run custom GAQL queries against Google Ads data. Use for advanced analysis—filter by keywords, matching types, or aggregate metrics by custom dimensions. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "google_ads": {
      "url": "https://gateway.pipeworx.io/google_ads/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/google_ads/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Google_ads data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

This pack runs against a connected google_ads account, so it needs a Pipeworx key: sign in at https://pipeworx.io/account, connect google_ads, then call `POST https://gateway.pipeworx.io/v1/tools/gads_list_campaigns` with `Authorization: Bearer <your Pipeworx key>`. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/gads_list_campaigns`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
