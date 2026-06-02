# mcp-google_ads

Google Ads MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 673+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `gads_list_campaigns` | List all campaigns in your Google Ads account. Returns campaign names, IDs, statuses, budgets, and types. Use to overview account structure or find a campaign ID for detailed analysis. |
| `gads_get_campaign` | Get detailed settings for a specific campaign. Returns name, status, budget, bidding strategy, and configuration. Use to review or audit a campaign\'s current setup. |
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

Or connect to the full Pipeworx gateway for access to all 673+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Google_ads data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
